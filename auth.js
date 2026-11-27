import { supabase } from './supabase.js';

// Função para fazer login
export async function fazerLogin(email, senha) {
    const { data, error } = await supabase.auth.signInWithPassword({
        email: email,
        password: senha,
    });

    if (error) {
        alert("Erro ao entrar: " + error.message);
        return false;
    }

    alert("Login realizado com sucesso!");
    return true;
}

// Função para cadastrar novo usuário
const { data, error } = await supabase.auth.signUp({
    email: email,
    password: senha,
    options: {
        emailRedirectTo: "https://benfica-dev.github.io/Minhas-Financas_Gerenciador-Financeiro/",
    },
});

// Função para verificar se há usuário logado ao abrir a página
export async function verificarSessao(aoLogarCallback) {
    const { data: { session } } = await supabase.auth.getSession();

    if (session) {
        // Usuário está logado, libera o app principal
        aoLogarCallback(session.user);
    } else {
        // Usuário NÃO está logado, mostra a tela de login e esconde o app
        const telaLogin = document.getElementById('tela-login');
        if (telaLogin) telaLogin.classList.remove('escondido');
    }
}

// Função para deslogar
export async function fazerLogout() {
    await supabase.auth.signOut();
    window.location.reload(); // Recarrega a página para voltar à tela de login
}
