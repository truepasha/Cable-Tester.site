(function() {
  function Tablesort(el, options) {
    if (!(this instanceof Tablesort)) return new Tablesort(el, options);
    if (!el || el.tagName !== 'TABLE') {
      throw new Error('Element must be a table');
    }
    this.init(el, options || {});
  }

  var sortOptions = [];

  var getInnerText = function(el, options) {
    return el.getAttribute(options.sortAttribute || 'data-sort') || el.textContent || el.innerText || '';
  };

  Tablesort.extend = function(name, pattern, sort) {
    if (typeof pattern !== 'function' || typeof sort !== 'function') {
      throw new Error('Pattern and sort must be functions');
    }
    sortOptions.push({ name, pattern, sort });
  };

  Tablesort.prototype = {
    init: function(el, options) {
      this.table = el;
      this.options = options;
      this.current = null;
      this.originalOrder = Array.from(el.tBodies[0].rows);

      var firstRow = el.tHead ? el.tHead.rows[el.tHead.rows.length - 1] : el.rows[0];
      if (!firstRow) return;

      for (let cell of firstRow.cells) {
        if (cell.getAttribute('data-sort-method') !== 'none') {
          cell.tabIndex = 0;
          cell.addEventListener('click', this.sortTable.bind(this, cell));
          // Додаємо подію для підказки при наведенні
          cell.addEventListener('mouseenter', this.showTooltip.bind(this, cell));
          cell.addEventListener('mouseleave', this.hideTooltip);
        }
      }
    },

    sortTable: function(header) {
      var column = header.cellIndex;
      var tbody = this.table.tBodies[0];
      var rows = Array.from(tbody.rows);

      // Перевірка: чи є хоча б одна заповнена комірка у колонці?
      var hasData = rows.some(row => {
        var cellText = getInnerText(row.cells[column], this.options).trim();
        return cellText !== '';
      });

      if (!hasData) {
        // Якщо даних немає, не сортуємо і не підсвічуємо колонку
        return;
      }

      var sortOrder = header.getAttribute('aria-sort');

      // Перше натискання - сортування за зростанням
      if (!sortOrder) {
        sortOrder = 'ascending';
      } else if (sortOrder === 'ascending') {
        sortOrder = 'descending';
      } else {
        sortOrder = null;
      }

      // Знімаємо підсвічування з попередньої колонки
      if (this.current && this.current !== header) {
        this.current.removeAttribute('aria-sort');
        this.updateHighlight(this.current, null);
      }

      this.current = sortOrder ? header : null;

      if (sortOrder) {
        header.setAttribute('aria-sort', sortOrder);
      } else {
        header.removeAttribute('aria-sort');
      }

      this.updateHighlight(header, sortOrder);

      if (!sortOrder) {
        // Повертаємо початковий порядок, якщо сортування відключене
        this.originalOrder.forEach(row => tbody.appendChild(row));
        return;
      }

      // Сортуємо рядки за напрямком сортування
      rows.sort((rowA, rowB) => {
        var a = getInnerText(rowA.cells[column], this.options).trim();
        var b = getInnerText(rowB.cells[column], this.options).trim();

        return sortOrder === 'ascending'
          ? caseInsensitiveSort(a, b)
          : caseInsensitiveSort(b, a);
      });

      rows.forEach(row => tbody.appendChild(row));
    },

    updateHighlight: function(header, sortOrder) {
      if (sortOrder) {
        header.setAttribute('aria-sort', sortOrder);
      } else {
        header.removeAttribute('aria-sort');
      }
    },

    showTooltip: function(header) {
      var column = header.cellIndex;
      var tbody = this.table.tBodies[0];
      var rows = Array.from(tbody.rows);

      // Перевіряємо, чи є хоча б одна заповнена комірка в колонці
      var hasData = rows.some(row => {
        var cellText = getInnerText(row.cells[column], this.options).trim();
        return cellText !== '';
      });

      // Показуємо підказку в залежності від наявності даних
      if (hasData) {
        header.title = 'Сортувати';
      } else {
        header.title = 'Сортування неможливе';
      }
    },

    hideTooltip: function(event) {
      event.target.removeAttribute('title');
    }
  };

  var caseInsensitiveSort = function(a, b) {
    a = a.toLowerCase();
    b = b.toLowerCase();
    return a.localeCompare(b);
  };

  window.Tablesort = Tablesort;
})();

document$.subscribe(function() {
  var tables = document.querySelectorAll("article table:not([class])")
  tables.forEach(function(table) {
    new Tablesort(table)
  })
})