/**
 * Constantes para "Números Mágicos", removendo-os da lógica de negócio.
 */
const ReportRules = {
  ADMIN_PRIORITY_THRESHOLD: 1000,
  USER_VISIBILITY_LIMIT: 500,
};

/**
 * [ESTRATÉGIA 1]
 * Responsável *apenas* por formatar relatórios em CSV.
 */
class CsvReportFormatter {
  generate(user, items) {
    let report = 'ID,NOME,VALOR,USUARIO\n';
    let total = 0;

    for (const item of items) {
      report += `${item.id},${item.name},${item.value},${user.name}\n`;
      total += item.value;
    }

    report += '\nTotal,,\n';
    report += `${total},,\n`;

    return report.trim();
  }
}

/**
 * [ESTRATÉGIA 2]
 * Responsável *apenas* por formatar relatórios em HTML.
 */
class HtmlReportFormatter {
  generate(user, items) {
    let report = '<html><body>\n';
    report += '<h1>Relatório</h1>\n';
    report += `<h2>Usuário: ${user.name}</h2>\n`;
    report += '<table>\n';
    report += '<tr><th>ID</th><th>Nome</th><th>Valor</th></tr>\n';

    let total = 0;

    for (const item of items) {
      const style = item.priority ? 'style="font-weight:bold;"' : '';
      report += `<tr ${style}><td>${item.id}</td><td>${item.name}</td><td>${item.value}</td></tr>\n`;
      total += item.value;
    }

    report += '</table>\n';
    report += `<h3>Total: ${total}</h3>\n`;
    report += '</body></html>\n';

    return report.trim();
  }
}

/**
 * O Coordenador.
 * (Trocado 'export class' por 'class' normal)
 */
class ReportGenerator {
  constructor(database) {
    this.db = database;
    
    // Mapeia os "tipos" para as classes de estratégia de formatação
    this.formatters = {
      'CSV': new CsvReportFormatter(),
      'HTML': new HtmlReportFormatter(),
    };
  }

  generateReport(reportType, user, items) {
    // 1. Extrai a lógica de filtragem
    const visibleItems = this._filterVisibleItems(items, user);

    // 2. Seleciona a estratégia correta
    const formatter = this.formatters[reportType];

    if (!formatter) {
      throw new Error(`Tipo de relatório não suportado: ${reportType}`);
    }

    // 3. Delega a geração do relatório
    return formatter.generate(user, visibleItems);
  }

  /**
   * (Método Extraído - CORRIGIDO)
   * Responsabilidade única: filtrar itens com base na permissão do usuário.
   * @private
   */
  _filterVisibleItems(items, user) {
    const visibleItems = [];

    for (const item of items) {
      if (user.role === 'ADMIN') {
        const reportItem = { ...item };
        
        if (item.value > ReportRules.ADMIN_PRIORITY_THRESHOLD) {
          reportItem.priority = true;
        }
        visibleItems.push(reportItem);

      // --- CORREÇÃO (no-collapsible-if) APLICADA AQUI ---
      // Os dois 'ifs' aninhados foram mesclados.
      } else if (user.role === 'USER' && item.value <= ReportRules.USER_VISIBILITY_LIMIT) {
          visibleItems.push({ ...item }); 
      }
    }
    
    return visibleItems;
  }
}

// --- MUDANÇA PRINCIPAL ---
// Em vez de 'export class', exportamos a classe no final
// usando o formato CommonJS.
module.exports = {
  ReportGenerator
};