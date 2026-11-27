import { supabase } from './supabase.js';

export async function fazerLogin(email, senha) {
    const { error } = await supabase.auth.signInWithPassword({
        email,
        password: senha,
    });

    if (error) {
        alert("Erro ao entrar: " + error.message);
        return false;
    }

    alert("Login realizado com sucesso!");
    return true;
}

export async function cadastrarUsuario(email, senha) {
    const { error } = await supabase.auth.signUp({
        email,
        password: senha,
        options: {
            emailRedirectTo: "https://benfica-dev.github.io/Minhas-Financas_Gerenciador-Financeiro/",
        },
    });

    if (error) {
        alert("Erro ao cadastrar: " + error.message);
        return false;
    }

    alert("Cadastro realizado! Verifique seu e-mail (se necessário) ou faça o login.");
    return true;
}

export async function verificarSessao(aoLogarCallback) {
    const { data: { session } } = await supabase.auth.getSession();

    if (session) {
        aoLogarCallback(session.user);
    } else {
        document.getElementById('tela-login')?.classList.remove('escondido');
    }
}

export async function fazerLogout() {
    const { error } = await supabase.auth.signOut();

    if (error) {
        alert("Erro ao sair: " + error.message);
        return;
    }

    window.location.reload();
}
