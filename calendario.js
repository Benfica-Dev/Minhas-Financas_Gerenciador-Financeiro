import { supabase } from './supabase.js';

document.addEventListener("DOMContentLoaded", function () {
    /*ELEMENTOS DO CALENDÁRIO*/
    const dias = document.getElementById("dias");
    const mesAno = document.getElementById("mesAno");
    const anterior = document.getElementById("anterior");
    const proximo = document.getElementById("proximo");
    const hojeBtn = document.getElementById("hoje");
    const novoEvento = document.getElementById("novoEvento");
    const tituloModal = document.getElementById("tituloModal");
    const excluirEvento = document.getElementById("excluirEvento");

    /*ELEMENTOS DO MODAL*/
    const modalEvento = document.getElementById("modalEvento");
    const cancelarEvento = document.getElementById("cancelarEvento");
    const salvarEvento = document.getElementById("salvarEvento");

    /*CAMPOS DO FORMULÁRIO*/
    const tituloEvento = document.getElementById("tituloEvento");
    const dataEvento = document.getElementById("dataEvento");
    const inicioEvento = document.getElementById("inicioEvento");
    const fimEvento = document.getElementById("fimEvento");
    const descricaoEvento = document.getElementById("descricaoEvento");
    const corEvento = document.getElementById("corEvento");
    const tipoFinanceiro = document.getElementById("tipoFinanceiro");

    /*DATA ATUAL E EDIÇÃO*/
    let dataAtual = new Date();
    let eventoEditando = null;

    /*EVENTOS VINDO DO SUPABASE*/
    let eventos = [];

    /*FORMATAR DATA*/
    function formatarData(data) {
        const ano = data.getFullYear();
        const mes = String(data.getMonth() + 1).padStart(2, "0");
        const dia = String(data.getDate()).padStart(2, "0");
        return `${ano}-${mes}-${dia}`;
    }

    /*BUSCAR EVENTOS DO SUPABASE*/
    async function carregarEventosDoBanco() {
        const { data, error } = await supabase.from('eventos').select('*');
        
        if (error) {
            console.error("Erro ao carregar eventos do Supabase:", error.message);
            return;
        }

        eventos = data || [];
        gerarCalendario();
        verificarNotificacoesDoDia();
    }

    /*ABRIR MODAL PARA CRIAR*/
    function abrirModal(data = null) {
        eventoEditando = null;
        if (modalEvento) modalEvento.classList.add("ativo");
        if (tituloModal) tituloModal.textContent = "Novo Lembrete Financeiro";

        if (tituloEvento) tituloEvento.value = "";
        if (dataEvento) dataEvento.value = data || formatarData(new Date());
        if (inicioEvento) inicioEvento.value = "";
        if (fimEvento) fimEvento.value = "";
        if (descricaoEvento) descricaoEvento.value = "";
        if (corEvento) corEvento.value = "verde";
        if (tipoFinanceiro) tipoFinanceiro.value = "normal";

        if (excluirEvento) excluirEvento.style.display = "none";
    }

    /*ABRIR MODAL PARA EDITAR*/
    function editarEvento(evento) {
        eventoEditando = evento.id;
        if (modalEvento) modalEvento.classList.add("ativo");
        if (tituloModal) tituloModal.textContent = "Editar Lembrete";

        if (tituloEvento) tituloEvento.value = evento.titulo || "";
        if (dataEvento) dataEvento.value = evento.data || "";
        if (inicioEvento) inicioEvento.value = evento.inicio || "";
        if (fimEvento) fimEvento.value = evento.fim || "";
        if (descricaoEvento) descricaoEvento.value = evento.descricao || "";
        if (corEvento) corEvento.value = evento.cor || "verde";
        if (tipoFinanceiro) tipoFinanceiro.value = evento.tipo_financeiro || "normal";

        if (excluirEvento) excluirEvento.style.display = "inline-block";
    }

    /*FECHAR MODAL*/
    function fecharModal() {
        if (modalEvento) modalEvento.classList.remove("ativo");
    }

    /*GERAR CALENDÁRIO*/
    function gerarCalendario() {
        if (!dias || !mesAno) return;

        const ano = dataAtual.getFullYear();
        const mes = dataAtual.getMonth();

        const primeiroDia = new Date(ano, mes, 1);
        const quantidadeDias = new Date(ano, mes + 1, 0).getDate();
        const diaSemana = primeiroDia.getDay();

        dias.innerHTML = "";

        mesAno.textContent = dataAtual.toLocaleDateString("pt-BR", {
            month: "long",
            year: "numeric"
        });

        for (let i = 0; i < diaSemana; i++) {
            const vazio = document.createElement("div");
            vazio.classList.add("dia");
            dias.appendChild(vazio);
        }

        for (let dia = 1; dia <= quantidadeDias; dia++) {
            const elemento = document.createElement("div");
            elemento.classList.add("dia");

            const dataCompleta = new Date(ano, mes, dia);
            const dataString = formatarData(dataCompleta);

            const numero = document.createElement("span");
            numero.classList.add("dia-numero");
            numero.textContent = dia;
            elemento.appendChild(numero);

            if (dataString === formatarData(new Date())) {
                elemento.classList.add("hoje");
            }

            elemento.addEventListener("click", function () {
                abrirModal(dataString);
            });

            const eventosDoDia = eventos.filter(function (evento) {
                return evento.data === dataString;
            });

            let temContaPagar = false;
            let temRecebimento = false;

            eventosDoDia.forEach(function (evento) {
                const elementoEvento = document.createElement("div");
                elementoEvento.classList.add("evento");
                elementoEvento.classList.add(evento.cor ? evento.cor : "verde");

                if (evento.tipo_financeiro === "pagar") {
                    temContaPagar = true;
                    elementoEvento.classList.add("evento-pagar");
                } else if (evento.tipo_financeiro === "receber") {
                    temRecebimento = true;
                    elementoEvento.classList.add("evento-receber");
                }

                const horario = document.createElement("span");
                horario.classList.add("evento-horario");
                horario.textContent = evento.inicio || "";

                const titulo = document.createElement("span");
                titulo.textContent = evento.titulo;

                elementoEvento.appendChild(horario);
                elementoEvento.appendChild(titulo);

                elementoEvento.addEventListener("click", function (e) {
                    e.stopPropagation();
                    editarEvento(evento);
                });

                elemento.appendChild(elementoEvento);
            });

            if (temContaPagar) {
                elemento.classList.add("dia-alerta-pagar");
            } else if (temRecebimento) {
                elemento.classList.add("dia-alerta-receber");
            }

            dias.appendChild(elemento);
        }
    }

    /*SALVAR OU EDITAR EVENTO NO SUPABASE*/
    if (salvarEvento) {
        salvarEvento.addEventListener("click", async function () {
            const titulo = tituloEvento ? tituloEvento.value.trim() : "";
            const data = dataEvento ? dataEvento.value : "";
            const inicio = inicioEvento ? inicioEvento.value : "";
            const fim = fimEvento ? fimEvento.value : "";
            const descricao = descricaoEvento ? descricaoEvento.value.trim() : "";
            const cor = corEvento ? corEvento.value : "verde";
            const tipo = tipoFinanceiro ? tipoFinanceiro.value : "normal";

            if (!titulo) {
                alert("Digite um título para o lembrete.");
                return;
            }

            if (!data) {
                alert("Escolha uma data.");
                return;
            }

            if (eventoEditando !== null) {
                // Atualiza no Supabase
                const { error } = await supabase
                    .from('eventos')
                    .update({
                        titulo: titulo,
                        data: data,
                        inicio: inicio,
                        fim: fim,
                        descricao: descricao,
                        cor: cor,
                        tipo_financeiro: tipo
                    })
                    .eq('id', eventoEditando);

                if (error) {
                    alert("Erro ao atualizar: " + error.message);
                    return;
                }
            } else {
                // Insere novo no Supabase
                const { error } = await supabase
                    .from('eventos')
                    .insert([{
                        titulo: titulo,
                        data: data,
                        inicio: inicio,
                        fim: fim,
                        descricao: descricao,
                        cor: cor,
                        tipo_financeiro: tipo
                    }]);

                if (error) {
                    alert("Erro ao salvar: " + error.message);
                    return;
                }
            }

            fecharModal();
            await carregarEventosDoBanco();
        });
    }

    /*EXCLUIR EVENTO NO SUPABASE*/
    if (excluirEvento) {
        excluirEvento.addEventListener("click", async function () {
            if (eventoEditando === null) return;

            if (!confirm("Deseja realmente excluir este lembrete?")) return;

            const { error } = await supabase
                .from('eventos')
                .delete()
                .eq('id', eventoEditando);

            if (error) {
                alert("Erro ao excluir: " + error.message);
                return;
            }

            fecharModal();
            await carregarEventosDoBanco();
        });
    }

    /*BOTÃO + EVENTO*/
    if (novoEvento) {
        novoEvento.addEventListener("click", function () {
            abrirModal();
        });
    }

    /*CANCELAR*/
    if (cancelarEvento) {
        cancelarEvento.addEventListener("click", function () {
            fecharModal();
        });
    }

    /*NAVEGAÇÃO ENTRE MESES*/
    if (anterior) {
        anterior.addEventListener("click", function () {
            dataAtual.setMonth(dataAtual.getMonth() - 1);
            gerarCalendario();
        });
    }

    if (proximo) {
        proximo.addEventListener("click", function () {
            dataAtual.setMonth(dataAtual.getMonth() + 1);
            gerarCalendario();
        });
    }

    if (hojeBtn) {
        hojeBtn.addEventListener("click", function () {
            dataAtual = new Date();
            gerarCalendario();
        });
    }

    /*NOTIFICAÇÕES*/
    function verificarNotificacoesDoDia() {
        if ("Notification" in window && Notification.permission !== "granted" && Notification.permission !== "denied") {
            Notification.requestPermission();
        }

        const hojeString = formatarData(new Date());
        const eventosDeHoje = eventos.filter(function(evento) {
            return evento.data === hojeString;
        });

        if (eventosDeHoje.length > 0 && "Notification" in window && Notification.permission === "granted") {
            eventosDeHoje.forEach(function(evento) {
                let tipoTexto = "Lembrete Financeiro";
                if (evento.tipo_financeiro === "pagar") {
                    tipoTexto = "Conta Vencendo Hoje!";
                } else if (evento.tipo_financeiro === "receber") {
                    tipoTexto = "Dia de Recebimento!";
                }

                new Notification(tipoTexto, {
                    body: `${evento.titulo}`,
                    icon: ""
                });
            });
        }
    }

    /*INICIALIZAÇÃO*/
    carregarEventosDoBanco();
});