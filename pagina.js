// pagina.js (Seu JS Central integrado ao Supabase)

import { supabase } from './supabase.js';
import { verificarSessao, fazerLogin, cadastrarUsuario } from './auth.js';
import { salvarGastosFixos, carregarGastosFixos } from './gastosf.js';
import { carregarCategorias, adicionarCategoria, adicionarGastoDiario } from './gastosd.js';
import { calcularEExibirResumo } from './resumo.js';
import { carregarMetas, adicionarMeta } from './metas.js';

// Função auxiliar para atualizar o resumo buscando os dados atuais da nuvem
async function atualizarResumoGeral() {
    const { data: configData } = await supabase
        .from('configuracoes')
        .select('salario')
        .eq('id', 1)
        .maybeSingle();
    const salario = configData ? (parseFloat(configData.salario) || 0) : 0;

    const { data: fixosData } = await supabase
        .from('gastos_fixos')
        .select('*')
        .eq('id', 1)
        .maybeSingle();
    const dadosFixos = fixosData || {};

    const { data: diariosData } = await supabase
        .from('gastos_diarios')
        .select('*');
    const listaDiarios = diariosData || [];

    calcularEExibirResumo(salario, dadosFixos, listaDiarios);
}

// FUNÇÃO PARA VERIFICAR E APLICAR O MODO PRO
async function verificarEAplicarModoPro(userId) {
    const { data: perfil, error } = await supabase
        .from('perfis')
        .select('is_pro')
        .eq('id', userId)
        .maybeSingle();

    if (perfil && perfil.is_pro === true) {
        console.log("Modo Pro ativado para este usuário!");
        
        // 1. Mostra todos os elementos que possuem a classe .recurso-pro (como o botão de imprimir)
        document.querySelectorAll('.recurso-pro').forEach(el => {
            el.classList.remove('escondido');
        });

        // 2. Esconde o botão/link de "Virar Pro" já que o usuário já é Pro
        document.querySelectorAll('.btn-pro').forEach(el => {
            el.classList.add('escondido');
        });

        // 3. Adiciona um selo visual PRO no título principal
        const tituloApp = document.querySelector('h1');
        if (tituloApp && !tituloApp.innerHTML.includes('PRO')) {
            tituloApp.innerHTML += " 🌟 <small style='color: gold;'>PRO</small>";
        }
    } else {
        console.log("Usuário no plano Gratuito.");
    }
}

// FUNÇÃO GLOBAL PARA ALTERNAR AS ABAS
window.mudarDeAba = async function(idDaAbaDesejada) {
    const todasAsAbas = document.querySelectorAll('.conteudo-principal .tela-do-app');

    todasAsAbas.forEach(aba => {
        aba.classList.add('escondido');
    });

    const abaParaMostrar = document.getElementById(idDaAbaDesejada);
    if (abaParaMostrar) {
        abaParaMostrar.classList.remove('escondido');
    }

    if (idDaAbaDesejada === 'tela-resumo') {
        await atualizarResumoGeral();
    } else if (idDaAbaDesejada === 'tela-controlem') {
        await carregarMetas();
    }
};

// EVENTO ÚNICO QUANDO A PÁGINA CARREGA
document.addEventListener('DOMContentLoaded', async () => {

    const telaLogin = document.getElementById('tela-login');
    const appPrincipal = document.getElementById('app-principal');

    // 1. Verifica a sessão de login do Supabase
    verificarSessao(async (usuarioLogado) => {
        if (telaLogin) telaLogin.classList.add('escondido');
        if (appPrincipal) appPrincipal.classList.remove('escondido');
        
        // Verifica se o usuário é Pro assim que logar com sucesso
        if (usuarioLogado && usuarioLogado.id) {
            await verificarEAplicarModoPro(usuarioLogado.id);
        }

        window.mudarDeAba('tela-resumo');
    });

    // 2. Eventos do formulário de login
    const formLogin = document.getElementById('form-login');
    if (formLogin) {
        formLogin.addEventListener('submit', async (e) => {
            e.preventDefault();
            const email = document.getElementById('email-login').value;
            const senha = document.getElementById('senha-login').value;

            const sucesso = await fazerLogin(email, senha);
            if (sucesso) {
                window.location.reload();
            }
        });
    }

    const btnCadastrar = document.getElementById('btn-cadastrar');
    if (btnCadastrar) {
        btnCadastrar.addEventListener('click', async () => {
            const email = document.getElementById('email-login').value;
            const senha = document.getElementById('senha-login').value;

            if (!email || !senha) {
                alert("Preencha o e-mail e a senha para se cadastrar.");
                return;
            }

            await cadastrarUsuario(email, senha);
        });
    }

    // --- LÓGICA DO SALÁRIO ---
    const inputSalario = document.getElementById('salario');

    const { data: configSalva } = await supabase
        .from('configuracoes')
        .select('salario')
        .eq('id', 1)
        .maybeSingle();

    if (configSalva && inputSalario) {
        inputSalario.value = configSalva.salario || '';
    }

    if (inputSalario) {
        inputSalario.addEventListener('change', async (e) => {
            const valorSalario = parseFloat(e.target.value) || 0;
            await supabase
                .from('configuracoes')
                .upsert({ id: 1, salario: valorSalario });

            await atualizarResumoGeral();
        });
    }

    // --- LÓGICA DOS GASTOS FIXOS ---
    await carregarGastosFixos();

    const formGastosFixos = document.getElementById('form-gastos-fixos');
    if (formGastosFixos) {
        formGastosFixos.addEventListener('submit', async (e) => {
            await salvarGastosFixos(e);
            await atualizarResumoGeral();
        });
    }

    // --- LÓGICA DOS GASTOS DIÁRIOS E CATEGORIAS ---
    await carregarCategorias();

    const formCategoria = document.getElementById('category-form');
    if (formCategoria) {
        formCategoria.addEventListener('submit', async (e) => {
            await adicionarCategoria(e);
        });
    }

    const formGastoDiario = document.getElementById('gasto-form');
    if (formGastoDiario) {
        formGastoDiario.addEventListener('submit', async (e) => {
            await adicionarGastoDiario(e);
            await atualizarResumoGeral();
        });
    }

    // --- LÓGICA DE METAS ---
    await carregarMetas();

    const formMeta = document.getElementById('form-meta');
    if (formMeta) {
        formMeta.addEventListener('submit', async (e) => {
            await adicionarMeta(e);
            await atualizarResumoGeral();
        });
    }

    await atualizarResumoGeral();
});

// Função global para gerar a impressão do relatório
window.gerarRelatorioImpressao = function() {
    window.print();
};