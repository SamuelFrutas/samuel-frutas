import { db } from './firebase.js';

import {
    doc,
    setDoc,
    collection,
    onSnapshot,
    deleteDoc
} from "https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js";

import {
    getStorage,
    ref,
    uploadBytes,
    getDownloadURL
} from "https://www.gstatic.com/firebasejs/10.8.0/firebase-storage.js";


// =========================================================
// FIRESTORE / STORAGE
// =========================================================

const storage = getStorage();


// =========================================================
// ESTADO
// =========================================================

let produtoEmEdicaoId = null;
let imagemUrlExistente = "";


// =========================================================
// ELEMENTOS DO FORMULÁRIO
// =========================================================

const tituloForm = document.getElementById('titulo-form');

const formProduto =
    document.getElementById('form-produto');

const inputNome =
    document.getElementById('nome-produto');

const selectCategoria =
    document.getElementById('categoria-produto');

const radiosTipoImagem =
    document.getElementsByName('tipo-imagem');

const campoImagemArquivo =
    document.getElementById('campo-imagem-arquivo');

const campoImagemUrl =
    document.getElementById('campo-imagem-url');

const inputImagemArquivo =
    document.getElementById('imagem-arquivo');

const inputImagemUrl =
    document.getElementById('imagem-url-input');

const previewContainer =
    document.getElementById('preview-container');

const imgPreview =
    document.getElementById('img-preview');

const btnSubmit =
    document.getElementById('btn-submit');

const btnCancelarEdicao =
    document.getElementById('btn-cancelar-edicao');


// =========================================================
// FORMAS DE VENDA
// =========================================================

const chkUnidade =
    document.getElementById('venda-unidade');

const chkQuilo =
    document.getElementById('venda-quilo');

const chkMaco =
    document.getElementById('venda-maco');

const chkDuzia =
    document.getElementById('venda-duzia');

const chkLote =
    document.getElementById('venda-lote');

const chkBdj = document.getElementById('venda-bdj');
const chkUmQuarto = document.getElementById('venda-1-4');
const chkUmOitavo = document.getElementById('venda-1-8');
const chkMetade = document.getElementById('venda-metade');

const grupoQtdLote =
    document.getElementById('grupo-qtd-lote');

const inputQtdLote =
    document.getElementById('qtd-por-lote');


// =========================================================
// STATUS
// =========================================================

const chkAtivo =
    document.getElementById('produto-ativo');


// =========================================================
// LISTA
// =========================================================

const listaProdutosBody =
    document.getElementById('lista-produtos-body');


// =========================================================
// IMAGEM — UPLOAD / URL
// =========================================================

if (radiosTipoImagem) {

    radiosTipoImagem.forEach((radio) => {

        radio.addEventListener('change', (e) => {

            limparPreview();

            if (e.target.value === 'arquivo') {

                if (campoImagemArquivo) {
                    campoImagemArquivo.style.display = 'block';
                }

                if (campoImagemUrl) {
                    campoImagemUrl.style.display = 'none';
                }

                if (inputImagemUrl) {
                    inputImagemUrl.value = '';
                }

            } else {

                if (campoImagemArquivo) {
                    campoImagemArquivo.style.display = 'none';
                }

                if (campoImagemUrl) {
                    campoImagemUrl.style.display = 'block';
                }

                if (inputImagemArquivo) {
                    inputImagemArquivo.value = '';
                }
            }
        });
    });
}


// =========================================================
// PREVIEW DO ARQUIVO
// =========================================================

if (inputImagemArquivo) {

    inputImagemArquivo.addEventListener('change', (e) => {

        const file = e.target.files[0];

        if (file) {

            const reader = new FileReader();

            reader.onload = (event) => {

                mostrarPreview(
                    event.target.result
                );
            };

            reader.readAsDataURL(file);

        } else if (imagemUrlExistente) {

            mostrarPreview(
                imagemUrlExistente
            );

        } else {

            limparPreview();
        }
    });
}


// =========================================================
// PREVIEW DA URL
// =========================================================

if (inputImagemUrl) {

    inputImagemUrl.addEventListener('input', (e) => {

        const url =
            e.target.value.trim();

        if (
            url.startsWith('http://') ||
            url.startsWith('https://')
        ) {

            mostrarPreview(url);

        } else {

            limparPreview();
        }
    });
}


// =========================================================
// MOSTRAR PREVIEW
// =========================================================

function mostrarPreview(src) {

    if (!imgPreview || !previewContainer) {
        return;
    }

    previewContainer.style.display = 'block';

    imgPreview.onload = () => {
        previewContainer.style.display = 'block';
    };

    imgPreview.onerror = () => {
        previewContainer.style.display = 'none';
    };

    imgPreview.src = src;
}


// =========================================================
// LIMPAR PREVIEW
// =========================================================

function limparPreview() {

    if (!previewContainer || !imgPreview) {
        return;
    }

    previewContainer.style.display =
        'none';

    imgPreview.src = '#';
}


// =========================================================
// LOTE
//
// IMPORTANTE:
//
// LOTE NÃO DESMARCA UNIDADE.
//
// Cadastro pode ter:
//
// Unidade + Lote
// Unidade + Quilo + Lote
// Unidade + Maço + Lote
// Unidade + Dúzia + Lote
//
// A escolha exclusiva entre as formas
// deve acontecer na tela de VENDA.
// =========================================================

function atualizarCampoLote() {

    if (!chkLote) {
        return;
    }

    if (chkLote.checked) {

        if (grupoQtdLote) {

            grupoQtdLote.style.display =
                'block';
        }

        if (inputQtdLote) {

            inputQtdLote.setAttribute(
                'required',
                'required'
            );
        }

    } else {

        if (grupoQtdLote) {

            grupoQtdLote.style.display =
                'none';
        }

        if (inputQtdLote) {

            inputQtdLote.removeAttribute(
                'required'
            );

            inputQtdLote.value = '';
        }
    }
}


// =========================================================
// EVENTO DO LOTE
// =========================================================

if (chkLote) {

    chkLote.addEventListener(
        'change',
        atualizarCampoLote
    );
}


// =========================================================
// RESETAR FORMULÁRIO
// =========================================================

function resetarFormulario() {

    produtoEmEdicaoId = null;

    imagemUrlExistente = "";


    if (formProduto) {

        formProduto.reset();
    }


    if (selectCategoria) {

        selectCategoria.value =
            'frutas';
    }


    if (tituloForm) {

        tituloForm.textContent =
            'Cadastro / Edição de Produtos';
    }


    if (btnSubmit) {

        btnSubmit.textContent =
            'Salvar Produto';

        btnSubmit.disabled =
            false;
    }


    if (btnCancelarEdicao) {

        btnCancelarEdicao.style.display =
            'none';
    }


    if (grupoQtdLote) {

        grupoQtdLote.style.display =
            'none';
    }


    if (inputQtdLote) {

        inputQtdLote.removeAttribute(
            'required'
        );

        inputQtdLote.value =
            '';
    }


    limparPreview();


    if (campoImagemArquivo) {

        campoImagemArquivo.style.display =
            'block';
    }


    if (campoImagemUrl) {

        campoImagemUrl.style.display =
            'none';
    }


    if (
        radiosTipoImagem &&
        radiosTipoImagem.length > 0
    ) {

        radiosTipoImagem[0].checked =
            true;
    }


    if (chkAtivo) {

        chkAtivo.checked =
            true;
    }
}


// =========================================================
// BOTÃO CANCELAR
// =========================================================

if (btnCancelarEdicao) {

    btnCancelarEdicao.addEventListener(
        'click',
        resetarFormulario
    );
}


// =========================================================
// CARREGAR PRODUTOS
// =========================================================

function carregarProdutos() {

    if (!listaProdutosBody) {

        console.error(
            'Elemento lista-produtos-body não encontrado.'
        );

        return;
    }


    const produtosRef =
        collection(
            db,
            'produtos'
        );


    onSnapshot(

        produtosRef,

        (snapshot) => {

            if (snapshot.empty) {

                listaProdutosBody.innerHTML = `
                    <tr>
                        <td
                            colspan="6"
                            style="
                                text-align:center;
                                color:#607d8b;
                                padding:25px;
                            "
                        >
                            Nenhum produto cadastrado.
                        </td>
                    </tr>
                `;

                return;
            }


            let html = '';

            const produtosDadosMap =
                new Map();


            snapshot.forEach((docSnap) => {

                const p =
                    docSnap.data();

                const id =
                    docSnap.id;


                produtosDadosMap.set(
                    id,
                    p
                );


                // ==========================================
                // FORMAS DE VENDA
                // ==========================================

                const unidades = [];


                if (
                    p.unidadesMedida?.unidade
                ) {

                    unidades.push(
                        'Unidade'
                    );
                }


                if (
                    p.unidadesMedida?.quilo
                ) {

                    unidades.push(
                        'Quilo'
                    );
                }


                if (
                    p.unidadesMedida?.maco
                ) {

                    unidades.push(
                        'Maço'
                    );
                }


                if (
                    p.unidadesMedida?.duzia
                ) {

                    unidades.push(
                        'Dúzia'
                    );
                }


                if (p.unidadesMedida?.bdj) unidades.push('BDJ');
                if (p.unidadesMedida?.umQuarto) unidades.push('1/4');
                if (p.unidadesMedida?.umOitavo) unidades.push('1/8');
                if (p.unidadesMedida?.metade) unidades.push('Metade');

                if (
                    p.unidadesMedida?.lote
                ) {

                    const qtd =
                        p.unidadesMedida
                            ?.quantidadePorLote;


                    unidades.push(
                        qtd
                            ? `Lote C/${qtd} un.`
                            : 'Lote'
                    );
                }


                // ==========================================
                // IMAGEM
                // ==========================================

                const imgHtml =
                    p.imagemUrl

                        ? `
                            <img
                                src="${escapeHTML(
                                    p.imagemUrl
                                )}"
                                class="img-tabela"
                                alt="${escapeHTML(
                                    p.nome || ''
                                )}"
                            >
                        `

                        : `
                            <span
                                style="color:#aaa;"
                            >
                                Sem img
                            </span>
                        `;


                // ==========================================
                // STATUS
                // ==========================================

                const ativo =
                    p.ativo !== undefined
                        ? p.ativo
                        : true;


                const statusHtml =
                    ativo

                        ? `
                            <span class="badge-ativo">
                                Ativo
                            </span>
                        `

                        : `
                            <span class="badge-inativo">
                                Inativo
                            </span>
                        `;


                const categoriaTexto =
                    (
                        p.categoria ||
                        'frutas'
                    ).toUpperCase();


                // ==========================================
                // LINHA
                // ==========================================

                html += `
                    <tr>

                        <td>
                            ${imgHtml}
                        </td>

                        <td>
                            <strong>
                                ${escapeHTML(
                                    p.nome || ''
                                )}
                            </strong>
                        </td>

                        <td>
                            ${escapeHTML(
                                categoriaTexto
                            )}
                        </td>

                        <td>
                            ${
                                unidades.length
                                    ? unidades.join(
                                        ' • '
                                    )
                                    : '-'
                            }
                        </td>

                        <td>
                            ${statusHtml}
                        </td>

                        <td>

                            <div
                                class="acoes-celula"
                            >

                                <button
                                    class="btn-editar"
                                    data-id="${escapeHTML(id)}"
                                    type="button"
                                >
                                    ✏️ Editar
                                </button>

                                <button
                                    class="btn-excluir"
                                    data-id="${escapeHTML(id)}"
                                    type="button"
                                >
                                    🗑️ Excluir
                                </button>

                            </div>

                        </td>

                    </tr>
                `;
            });


            listaProdutosBody.innerHTML =
                html;


            // ==========================================
            // BOTÃO EDITAR
            // ==========================================

            document
                .querySelectorAll(
                    '.btn-editar'
                )
                .forEach((btn) => {

                    btn.addEventListener(
                        'click',
                        (e) => {

                            const idProduto =
                                e.currentTarget
                                    .getAttribute(
                                        'data-id'
                                    );


                            const produto =
                                produtosDadosMap.get(
                                    idProduto
                                );


                            if (produto) {

                                preencherFormularioParaEdicao(
                                    idProduto,
                                    produto
                                );
                            }
                        }
                    );
                });


            // ==========================================
            // BOTÃO EXCLUIR
            // ==========================================

            document
                .querySelectorAll(
                    '.btn-excluir'
                )
                .forEach((btn) => {

                    btn.addEventListener(
                        'click',
                        async (e) => {

                            const idProduto =
                                e.currentTarget
                                    .getAttribute(
                                        'data-id'
                                    );


                            const confirmar =
                                confirm(
                                    'Tem certeza que deseja excluir este produto?'
                                );


                            if (!confirmar) {
                                return;
                            }


                            try {

                                await deleteDoc(
                                    doc(
                                        db,
                                        'produtos',
                                        idProduto
                                    )
                                );


                                if (
                                    produtoEmEdicaoId ===
                                    idProduto
                                ) {

                                    resetarFormulario();
                                }


                                alert(
                                    'Produto excluído com sucesso!'
                                );

                            } catch (error) {

                                console.error(
                                    'Erro ao excluir:',
                                    error
                                );


                                alert(
                                    'Erro ao excluir o produto.'
                                );
                            }
                        }
                    );
                });
        },

        (error) => {

            console.error(
                'Erro ao carregar produtos:',
                error
            );


            listaProdutosBody.innerHTML = `
                <tr>
                    <td
                        colspan="6"
                        style="
                            text-align:center;
                            color:#d32f2f;
                            padding:25px;
                        "
                    >
                        Erro ao carregar produtos.
                    </td>
                </tr>
            `;
        }
    );
}


// =========================================================
// PREENCHER FORMULÁRIO PARA EDIÇÃO
// =========================================================

function preencherFormularioParaEdicao(
    id,
    p
) {

    produtoEmEdicaoId =
        id;


    imagemUrlExistente =
        p.imagemUrl || "";


    // ==========================================
    // NOME
    // ==========================================

    if (inputNome) {

        inputNome.value =
            p.nome || "";
    }


    // ==========================================
    // CATEGORIA
    // ==========================================

    if (selectCategoria) {

        selectCategoria.value =
            p.categoria || 'frutas';
    }


    // ==========================================
    // FORMAS DE VENDA
    //
    // IMPORTANTE:
    // Unidade e Lote podem ficar juntos.
    // ==========================================

    if (chkUnidade) {

        chkUnidade.checked =
            !!p.unidadesMedida?.unidade;
    }


    if (chkQuilo) {

        chkQuilo.checked =
            !!p.unidadesMedida?.quilo;
    }


    if (chkMaco) {

        chkMaco.checked =
            !!p.unidadesMedida?.maco;
    }


    if (chkDuzia) {

        chkDuzia.checked =
            !!p.unidadesMedida?.duzia;
    }


    if (chkLote) chkLote.checked = !!p.unidadesMedida?.lote;
    if (chkBdj) chkBdj.checked = !!p.unidadesMedida?.bdj;
    if (chkUmQuarto) chkUmQuarto.checked = !!p.unidadesMedida?.umQuarto;
    if (chkUmOitavo) chkUmOitavo.checked = !!p.unidadesMedida?.umOitavo;
    if (chkMetade) chkMetade.checked = !!p.unidadesMedida?.metade;


    // ==========================================
    // LOTE
    // ==========================================

    if (
        chkLote &&
        chkLote.checked
    ) {

        if (grupoQtdLote) {

            grupoQtdLote.style.display =
                'block';
        }


        if (inputQtdLote) {

            inputQtdLote.value =
                p.unidadesMedida
                    ?.quantidadePorLote || '';


            inputQtdLote.setAttribute(
                'required',
                'required'
            );
        }

    } else {

        if (grupoQtdLote) {

            grupoQtdLote.style.display =
                'none';
        }


        if (inputQtdLote) {

            inputQtdLote.value =
                '';

            inputQtdLote.removeAttribute(
                'required'
            );
        }
    }


    // ==========================================
    // STATUS
    // ==========================================

    if (chkAtivo) {

        chkAtivo.checked =
            p.ativo !== undefined
                ? p.ativo
                : true;
    }


    // ==========================================
    // IMAGEM
    // ==========================================

    if (p.imagemUrl) {

        if (inputImagemUrl) {

            inputImagemUrl.value =
                p.imagemUrl;
        }


        if (
            radiosTipoImagem &&
            radiosTipoImagem.length > 1
        ) {

            radiosTipoImagem[1].checked =
                true;
        }


        if (campoImagemArquivo) {

            campoImagemArquivo.style.display =
                'none';
        }


        if (campoImagemUrl) {

            campoImagemUrl.style.display =
                'block';
        }


        mostrarPreview(
            p.imagemUrl
        );

    } else {

        if (inputImagemUrl) {

            inputImagemUrl.value =
                '';
        }


        if (inputImagemArquivo) {

            inputImagemArquivo.value =
                '';
        }


        if (
            radiosTipoImagem &&
            radiosTipoImagem.length > 0
        ) {

            radiosTipoImagem[0].checked =
                true;
        }


        if (campoImagemArquivo) {

            campoImagemArquivo.style.display =
                'block';
        }


        if (campoImagemUrl) {

            campoImagemUrl.style.display =
                'none';
        }


        limparPreview();
    }


    // ==========================================
    // TÍTULO
    // ==========================================

    if (tituloForm) {

        tituloForm.textContent =
            `Editando Produto: ${p.nome || ''}`;
    }


    // ==========================================
    // BOTÃO
    // ==========================================

    if (btnSubmit) {

        btnSubmit.textContent =
            'Salvar Alterações';
    }


    if (btnCancelarEdicao) {

        btnCancelarEdicao.style.display =
            'inline-block';
    }


    // ==========================================
    // SCROLL
    // ==========================================

    window.scrollTo({
        top: 0,
        behavior: 'smooth'
    });
}


// =========================================================
// SALVAR / ATUALIZAR PRODUTO
// =========================================================

if (formProduto) {

    formProduto.addEventListener(
        'submit',
        async (e) => {

            e.preventDefault();


            // ==========================================
            // DADOS BÁSICOS
            // ==========================================

            const nome =
                inputNome?.value.trim() || '';


            const categoria =
                selectCategoria?.value ||
                'frutas';


            // ==========================================
            // FORMAS DE VENDA
            //
            // ATENÇÃO:
            // NÃO existe mais exclusividade aqui.
            //
            // Pode salvar:
            // Unidade + Lote
            // Unidade + Quilo + Lote
            // etc.
            // ==========================================

            const permiteUnidade =
                !!chkUnidade?.checked;


            const permiteQuilo =
                !!chkQuilo?.checked;


            const permiteMaco =
                !!chkMaco?.checked;


            const permiteDuzia =
                !!chkDuzia?.checked;


            const permiteLote =
                !!document.querySelector('#venda-lote:checked');

            // Novas formas de venda: consultar diretamente o
            // formulário no momento de salvar.
            const permiteBdj =
                !!document.querySelector('#venda-bdj:checked');

            const permiteUmQuarto =
                !!document.querySelector('#venda-1-4:checked');

            const permiteUmOitavo =
                !!document.querySelector('#venda-1-8:checked');

            const permiteMetade =
                !!document.querySelector('#venda-metade:checked');


            const ativo =
                chkAtivo
                    ? chkAtivo.checked
                    : true;


            // ==========================================
            // VALIDAÇÃO DO NOME
            // ==========================================

            if (!nome) {

                alert(
                    'Digite o nome do produto.'
                );

                return;
            }


            // ==========================================
            // VALIDAÇÃO DAS FORMAS
            // ==========================================

            if (
                !permiteUnidade &&
                !permiteQuilo &&
                !permiteMaco &&
                !permiteDuzia &&
                !permiteLote &&
                !permiteBdj &&
                !permiteUmQuarto &&
                !permiteUmOitavo &&
                !permiteMetade
            ) {

                alert(
                    'Selecione pelo menos uma forma de venda!'
                );

                return;
            }


            // ==========================================
            // VALIDAÇÃO DO LOTE
            // ==========================================

            let qtdLote = null;


            if (permiteLote) {

                qtdLote =
                    parseInt(
                        inputQtdLote?.value,
                        10
                    );


                if (
                    !Number.isInteger(qtdLote) ||
                    qtdLote < 1
                ) {

                    alert(
                        'Informe uma quantidade válida para o lote!'
                    );


                    if (inputQtdLote) {

                        inputQtdLote.focus();
                    }


                    return;
                }
            }


            // ==========================================
            // TIPO DE IMAGEM
            // ==========================================

            let tipoImagemSelecionado =
                'arquivo';


            if (radiosTipoImagem) {

                radiosTipoImagem.forEach(
                    (radio) => {

                        if (radio.checked) {

                            tipoImagemSelecionado =
                                radio.value;
                        }
                    }
                );
            }


            // ==========================================
            // DESABILITA BOTÃO
            // ==========================================

            if (btnSubmit) {

                btnSubmit.disabled =
                    true;


                btnSubmit.textContent =
                    produtoEmEdicaoId
                        ? 'Atualizando...'
                        : 'Salvando...';
            }


            try {

                // ==========================================
                // GERAR ID
                // ==========================================

                const idProduto =
                    produtoEmEdicaoId

                        ? produtoEmEdicaoId

                        : gerarIdProduto(
                            nome
                        );


                // ==========================================
                // IMAGEM
                // ==========================================

                let imagemUrl =
                    imagemUrlExistente;


                if (
                    tipoImagemSelecionado ===
                    'arquivo'
                ) {

                    if (
                        inputImagemArquivo &&
                        inputImagemArquivo.files &&
                        inputImagemArquivo.files.length > 0
                    ) {

                        const file =
                            inputImagemArquivo
                                .files[0];


                        const fileExtension =
                            file.name
                                .split('.')
                                .pop()
                                .toLowerCase();


                        const storageRef =
                            ref(
                                storage,
                                `produtos/${idProduto}.${fileExtension}`
                            );


                        await uploadBytes(
                            storageRef,
                            file
                        );


                        imagemUrl =
                            await getDownloadURL(
                                storageRef
                            );
                    }

                } else {

                    imagemUrl =
                        inputImagemUrl?.value.trim() || '';
                }


                // ==========================================
                // FORMAS DE VENDA
                // ==========================================

                const formasVenda = [];


                if (permiteUnidade) {

                    formasVenda.push({

                        tipo: 'Unidade',

                        rotulo: 'Unidade'
                    });
                }


                if (permiteQuilo) {

                    formasVenda.push({

                        tipo: 'Quilo',

                        rotulo: 'Quilo'
                    });
                }


                if (permiteMaco) {

                    formasVenda.push({

                        tipo: 'Maço',

                        rotulo: 'Maço'
                    });
                }


                if (permiteDuzia) {

                    formasVenda.push({

                        tipo: 'Dúzia',

                        rotulo: 'Dúzia',

                        quantidade: 12
                    });
                }


                if (permiteBdj) formasVenda.push({ tipo: 'BDJ', rotulo: 'BDJ' });
                if (permiteUmQuarto) formasVenda.push({ tipo: '1/4', rotulo: '1/4' });
                if (permiteUmOitavo) formasVenda.push({ tipo: '1/8', rotulo: '1/8' });
                if (permiteMetade) formasVenda.push({ tipo: 'Metade', rotulo: 'Metade' });

                if (permiteLote) {

                    formasVenda.push({

                        tipo: 'Lote',

                        rotulo:
                            `Lote C/${qtdLote} un.`,

                        quantidade:
                            qtdLote
                    });
                }


                // ==========================================
                // DADOS DO PRODUTO
                // ==========================================

                const dadosProduto = {

                    nome: nome,

                    categoria: categoria,

                    ativo: ativo,

                    imagemUrl: imagemUrl,

                    unidadesMedida: {

                        unidade:
                            permiteUnidade,

                        quilo:
                            permiteQuilo,

                        maco:
                            permiteMaco,

                        duzia:
                            permiteDuzia,

                        lote:
                            permiteLote,

                        bdj: permiteBdj,
                        umQuarto: permiteUmQuarto,
                        umOitavo: permiteUmOitavo,
                        metade: permiteMetade,

                        quantidadePorLote:
                            permiteLote
                                ? qtdLote
                                : null
                    },

                    formasVenda:
                        formasVenda,

                    atualizadoEm:
                        new Date()
                };


                // ==========================================
                // SALVAR FIRESTORE
                // ==========================================

                const docRef =
                    doc(
                        db,
                        'produtos',
                        idProduto
                    );


                await setDoc(
                    docRef,
                    dadosProduto,
                    {
                        merge: true
                    }
                );


                // ==========================================
                // SUCESSO
                // ==========================================

                alert(
                    produtoEmEdicaoId

                        ? `Produto "${nome}" atualizado!`

                        : `Produto "${nome}" salvo!`
                );


                resetarFormulario();

            } catch (error) {

                console.error(
                    'Erro ao salvar produto:',
                    error
                );


                alert(
                    `Erro ao salvar o produto.\n\n${error.message || error}`
                );

            } finally {

                if (btnSubmit) {

                    btnSubmit.disabled =
                        false;


                    btnSubmit.textContent =
                        produtoEmEdicaoId

                            ? 'Salvar Alterações'

                            : 'Salvar Produto';
                }
            }
        }
    );
}


// =========================================================
// GERAR ID DO PRODUTO
// =========================================================

function gerarIdProduto(nome) {

    return nome

        .toLowerCase()

        .normalize('NFD')

        .replace(
            /[\u0300-\u036f]/g,
            ''
        )

        .replace(
            /[^a-z0-9]+/g,
            '_'
        )

        .replace(
            /^_+|_+$/g,
            ''
        );
}


// =========================================================
// ESCAPE HTML
// =========================================================

function escapeHTML(value) {

    return String(value)

        .replaceAll(
            '&',
            '&amp;'
        )

        .replaceAll(
            '<',
            '&lt;'
        )

        .replaceAll(
            '>',
            '&gt;'
        )

        .replaceAll(
            '"',
            '&quot;'
        )

        .replaceAll(
            "'",
            '&#039;'
        );
}


// =========================================================
// INICIAR
// =========================================================

carregarProdutos();


// =========================================================
// GARANTIR ESTADO INICIAL DO LOTE
// =========================================================

atualizarCampoLote();