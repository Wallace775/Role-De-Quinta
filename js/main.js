const SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbzKHmS6sQE7P2wVQ2gnGbl7oRJQLqqvBhf0Bp1rVB7CJ4XIItl0IAz6Zx4NvSl6S97T6g/exec';

let carrinho = [];

function adicionarAoCarrinho(nome, preco, tamanhoId, qtdId) {
  const tamanhoSelect = document.getElementById(tamanhoId);
  const qtdInput = document.getElementById(qtdId);
  const tamanho = tamanhoSelect.value;
  const quantidade = parseInt(qtdInput.value) || 1;

  const itemExistente = carrinho.find(item => item.nome === nome && item.tamanho === tamanho);

  if (itemExistente) {
    itemExistente.qtd += quantidade;
  } else {
    const item = {
      id: Date.now(),
      nome: nome,
      preco: preco,
      tamanho: tamanho,
      qtd: quantidade
    };
    carrinho.push(item);
  }

  atualizarCarrinho();
  animarCarrinho();
}

function animarCarrinho() {
  const btnCarrinho = document.querySelector('.btn-carrinho');
  btnCarrinho.style.transform = 'scale(1.2)';
  btnCarrinho.style.transition = 'transform 0.2s ease';

  setTimeout(() => {
    btnCarrinho.style.transform = 'scale(1)';
  }, 200);
}

function removerDoCarrinho(id) {
  carrinho = carrinho.filter(item => item.id !== id);
  atualizarCarrinho();
}

function atualizarCarrinho() {
  const countEl = document.getElementById('carrinho-count');
  const itensEl = document.getElementById('carrinho-itens');
  const valorEl = document.getElementById('carrinho-valor');

  const totalItens = carrinho.reduce((sum, item) => sum + item.qtd, 0);
  countEl.textContent = totalItens;

  if (carrinho.length === 0) {
    itensEl.innerHTML = '<p class="carrinho-vazio">Seu carrinho está vazio 🏍️</p>';
    valorEl.textContent = 'R$ 0,00';
  } else {
    itensEl.innerHTML = carrinho.map(item => `
      <div class="carrinho-item">
        <div class="carrinho-item-info">
          <strong>${item.nome}</strong>
          <small>Tamanho: ${item.tamanho} | Qtd: ${item.qtd}</small>
        </div>
        <div class="carrinho-item-actions">
          <span class="carrinho-item-preco">R$ ${(item.preco * item.qtd).toFixed(2).replace('.', ',')}</span>
          <button class="carrinho-item-remover" onclick="removerDoCarrinho(${item.id})">🗑️</button>
        </div>
      </div>
    `).join('');

    const total = carrinho.reduce((sum, item) => sum + (item.preco * item.qtd), 0);
    valorEl.textContent = `R$ ${total.toFixed(2).replace('.', ',')}`;
  }
}

function toggleCarrinho() {
  const modal = document.getElementById('modal-carrinho');
  modal.classList.toggle('active');
}

function abrirCheckout() {
  if (carrinho.length === 0) {
    alert('Seu carrinho está vazio! Adicione produtos antes de finalizar.');
    return;
  }

  toggleCarrinho();
  const modal = document.getElementById('modal-checkout');
  modal.classList.add('active');

  const resumoEl = document.getElementById('checkout-resumo');
  const total = carrinho.reduce((sum, item) => sum + (item.preco * item.qtd), 0);

  resumoEl.innerHTML = `
    <div class="resumo-itens">
      ${carrinho.map(item => `
        <div class="resumo-item">
          <span>${item.nome} (Tam: ${item.tamanho}) - Qtd: ${item.qtd}</span>
          <span>R$ ${(item.preco * item.qtd).toFixed(2).replace('.', ',')}</span>
        </div>
      `).join('')}
    </div>
    <div class="resumo-total">
      <strong>TOTAL: R$ ${total.toFixed(2).replace('.', ',')}</strong>
    </div>
  `;

  document.getElementById('pix-valor-destaque').textContent = `R$ ${total.toFixed(2).replace('.', ',')}`;
}

function fecharCheckout() {
  const modal = document.getElementById('modal-checkout');
  modal.classList.remove('active');
}

function copiarPix() {
  const chave = '41999684188';

  navigator.clipboard.writeText(chave).then(() => {
    const msg = document.getElementById('copy-msg');
    msg.textContent = '✅ Chave PIX copiada!';

    setTimeout(() => {
      msg.textContent = '';
    }, 3000);
  }).catch(err => {
    console.error('Erro ao copiar:', err);
    const msg = document.getElementById('copy-msg');
    msg.textContent = '❌ Erro ao copiar. Tente manualmente.';

    setTimeout(() => {
      msg.textContent = '';
    }, 3000);
  });
}

function finalizarPedido(event) {
  event.preventDefault();

  const nome = document.getElementById('nome').value;
  const whatsapp = document.getElementById('whatsapp').value;

  if (carrinho.length === 0) {
    alert('Seu carrinho está vazio!');
    return;
  }

  const btnConfirmar = document.getElementById('btn-confirmar-pedido');
  if (!btnConfirmar) {
    alert('Erro interno: botão de confirmação não encontrado.');
    return;
  }

  const total = carrinho.reduce((sum, item) => sum + (item.preco * item.qtd), 0);

  let pedidoDetalhado = '';
  carrinho.forEach(item => {
    pedidoDetalhado += `${item.nome} (Tam: ${item.tamanho}, Qtd: ${item.qtd}) | `;
  });

  const dadosPlanilha = {
    whatsapp: whatsapp,
    cliente: nome,
    pedido: pedidoDetalhado,
    valorTotal: `R$ ${total.toFixed(2).replace('.', ',')}`,
    idPedido: Math.floor(100000 + Math.random() * 900000).toString()
  };

  // iOS Safari: abrir WhatsApp IMEDIATAMENTE (antes do fetch)
  // Isso evita o bloqueio de pop-up/redirecionamento
  const numeroDavid = '5541999684188';
  let itensMensagem = '';
  carrinho.forEach(item => {
    itensMensagem += `- ${item.nome} (Tam: ${item.tamanho}) - Qtd: ${item.qtd}%0A`;
  });

  let mensagem = `🏍️ *NOVO PEDIDO - ROLÊ DE QUINTA* 🏍️%0A%0A`;
  mensagem += `👤 *CLIENTE:* ${nome}%0A`;
  mensagem += `📱 *WHATSAPP:* ${whatsapp}%0A%0A`;
  mensagem += `📦 *ITENS:*%0A${itensMensagem}%0A`;
  mensagem += `💰 *TOTAL:* R$ ${total.toFixed(2).replace('.', ',')}%0A%0A`;
  mensagem += `✅ *PEDIDO JÁ REGISTRADO NA PLANILHA OFICIAL*%0A%0A`;
  mensagem += `⚠️ *AVISO:* O comprovante do PIX será enviado em seguida.`;

  const whatsappUrl = `https://wa.me/${numeroDavid}?text=${mensagem}`;

  // Abre o WhatsApp imediatamente (iOS não bloqueia ação síncrona)
  window.location.href = whatsappUrl;

  // Fetch roda em background sem interferir no redirecionamento
  fetch(SCRIPT_URL, {
    method: 'POST',
    mode: 'no-cors',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(dadosPlanilha)
  })
  .then(() => {
    console.log('✅ Pedido registrado na planilha');
  })
  .catch((err) => {
    console.log('⚠️ Erro ao registrar na planilha, mas WhatsApp foi aberto', err);
  })
  .finally(() => {
    // Limpa o carrinho e formulário após envio
    carrinho = [];
    atualizarCarrinho();
    fecharCheckout();
    event.target.reset();
    btnConfirmar.textContent = 'CONFIRMAR PEDIDO';
    btnConfirmar.disabled = false;
  });
}

document.addEventListener('DOMContentLoaded', function() {
  const whatsappInput = document.getElementById('whatsapp');
  if (whatsappInput) {
    whatsappInput.addEventListener('input', function(e) {
      let value = e.target.value.replace(/\D/g, '');
      value = value.replace(/^(\d{2})(\d)/g, '($1) $2');
      value = value.replace(/(\d)(\d{4})$/, '$1-$2');
      e.target.value = value.substring(0, 15);
    });
  }

  atualizarCarrinho();
});

const observerOptions = {
  threshold: 0.1,
  rootMargin: '0px 0px -50px 0px'
};

const observer = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.style.opacity = '1';
      entry.target.style.transform = 'translateY(0)';
    }
  });
}, observerOptions);

document.querySelectorAll('.vitrine, .medidas, .regras, .como-comprar, .suporte').forEach(section => {
  section.style.opacity = '0';
  section.style.transform = 'translateY(30px)';
  section.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
  observer.observe(section);
});

document.querySelectorAll('a[href^="#"]').forEach(anchor => {
  anchor.addEventListener('click', function(e) {
    const href = this.getAttribute('href');
    if (href === '#') return;

    e.preventDefault();
    const target = document.querySelector(href);
    if (target) {
      target.scrollIntoView({
        behavior: 'smooth',
        block: 'start'
      });
    }
  });
});
