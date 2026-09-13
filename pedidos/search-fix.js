const search = document.getElementById('search');
const products = document.getElementById('products');

if (search && products) {
  search.addEventListener('input', () => {
    const query = search.value.trim().toLocaleLowerCase('pt-BR');
    const cards = [...products.querySelectorAll('.product')];

    let visible = 0;
    cards.forEach(card => {
      const name = card.querySelector('.name')?.textContent?.toLocaleLowerCase('pt-BR') || '';
      const match = !query || name.includes(query);
      card.style.display = match ? '' : 'none';
      if (match) visible++;
    });

    let empty = products.querySelector('.search-empty');
    if (!visible && cards.length) {
      if (!empty) {
        empty = document.createElement('div');
        empty.className = 'empty search-empty';
        products.appendChild(empty);
      }
      empty.textContent = 'Nenhum produto encontrado.';
    } else if (empty) {
      empty.remove();
    }
  });
}
