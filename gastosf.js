// gastosf.js
import { supabase } from './supabase.js';

// Função responsável por salvar ou atualizar os gastos fixos no Supabase
export async function salvarGastosFixos(event, salvarCallback) {
    if (event) event.preventDefault(); // Impede a página de recarregar

    // Captura os elementos de forma segura
    const elLuz = document.getElementById('gasto-luz');
    const elAgua = document.getElementById('gasto-agua');
    const elInternet = document.getElementById('gasto-internet');
    const elMercado = document.getElementById('gasto-mercado');

    // Pega os valores digitados nos inputs
    const luz = elLuz ? (parseFloat(elLuz.value) || 0) : 0;
    const agua = elAgua ? (parseFloat(elAgua.value) || 0) : 0;
    const internet = elInternet ? (parseFloat(elInternet.value) || 0) : 0;
    const mercado = elMercado ? (parseFloat(elMercado.value) || 0) : 0;
    const total = luz + agua + internet + mercado;

    // Cria o objeto com os dados
    const gastosFixos = {
        id: 1, // Mantém sempre no ID 1 para atualizar os gastos fixos em vez de duplicar linhas
        luz,
        agua,
        internet,
        mercado,
        total
    };

    // Usa .upsert() para atualizar se o id 1 já existir, ou criar se for a primeira vez
    const { error } = await supabase
        .from('gastos_fixos')
        .upsert(gastosFixos);

    if (error) {
        console.error('Erro ao salvar no Supabase:', error.message);
        alert('Erro ao salvar os gastos fixos na nuvem.');
        return;
    }

    // Mantém o seu callback funcionando caso seu arquivo principal use ele para atualizar gráficos ou tela
    if (salvarCallback) {
        salvarCallback('gastosFixos', gastosFixos);
    }

    alert('Gastos fixos salvos na nuvem com sucesso!');
}

// Função para carregar os gastos salvos quando abrir a página (Corrigido com maybeSingle)
export async function carregarGastosFixos() {
    const { data, error } = await supabase
        .from('gastos_fixos')
        .select('*')
        .eq('id', 1)
        .maybeSingle(); // <-- Alterado de .single() para .maybeSingle() para evitar erro 406

    if (error || !data) return null;

    // Se os inputs existirem na tela atual, já preenche eles automaticamente
    const elLuz = document.getElementById('gasto-luz');
    const elAgua = document.getElementById('gasto-agua');
    const elInternet = document.getElementById('gasto-internet');
    const elMercado = document.getElementById('gasto-mercado');

    if (elLuz) elLuz.value = data.luz || "";
    if (elAgua) elAgua.value = data.agua || "";
    if (elInternet) elInternet.value = data.internet || "";
    if (elMercado) elMercado.value = data.mercado || "";

    return data;
}