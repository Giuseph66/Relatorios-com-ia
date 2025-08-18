 // Função para exportar como PDF
 async function exportToPDF() {
  const loading = document.getElementById('loading');
  const btnExport = document.querySelector('.btn-export');
  
  // Mostrar loading
  loading.style.display = 'block';
  btnExport.disabled = true;
  btnExport.textContent = 'Gerando...';
  
  try {
    // Ocultar elementos que não devem aparecer no PDF
    const headerActions = document.querySelector('.header-actions');
    const nav = document.querySelector('nav');
    const reportTypeSelector = document.querySelector('.report-type-selector');
    const helpButton = document.getElementById('helpButton');
    headerActions.style.display = 'none';
    nav.style.display = 'none';
    reportTypeSelector.style.display = 'none';
    if (helpButton) helpButton.style.display = 'none';
    
    // Criar PDF com layout organizado
    const { jsPDF } = window.jspdf;
    const pdf = new jsPDF('p', 'mm', 'a4');
    
    // Obter a fonte selecionada
    const selectedFont = document.getElementById('fontFamily').value;
    let pdfFont = 'helvetica'; // Fonte padrão do jsPDF
    
    // Mapear fontes para as disponíveis no jsPDF
    const fontMapping = {
      'arial': 'helvetica',
      'times': 'times',
      'helvetica': 'helvetica',
      'georgia': 'times', // Georgia não disponível, usar Times
      'verdana': 'helvetica', // Verdana não disponível, usar Helvetica
      'courier': 'courier'
    };
    
    pdfFont = fontMapping[selectedFont] || 'helvetica';
    
    // Configurações de página
    const pageWidth = pdf.internal.pageSize.getWidth();
    const pageHeight = pdf.internal.pageSize.getHeight();
    const margin = 20;
    const contentWidth = pageWidth - (2 * margin);
    
    // Obter dados do relatório
    const titleElement = document.querySelector('h1');
    let title = titleElement ? titleElement.textContent.trim() : '';
    
    // Remover acentos do titulo
    
    // Validar título
    if (!title || title === 'Título do Relatório') {
      title = 'Relatório Acadêmico';
    }
    
    // Limitar tamanho máximo do título para evitar problemas de layout
    if (title.length > 120) {
      title = title.substring(0, 117) + '...';
    }
    
    const author = 'Autor: ' + document.querySelector('.autor').textContent.replace('Autor: ', '') || 'Nome do Autor';
    const professor = 'Professor: ' + document.querySelector('.professor').textContent.replace('Professor: ', '') || 'Nome do Professor';
    const currentDate = new Date().toLocaleDateString('pt-BR');
    
    let yPosition = margin;
    
    // Primeira página - Cabeçalho
    // Título no topo com quebra de linha para títulos longos
    pdf.setFontSize(18);
    pdf.setFont(pdfFont, 'bold');
    
    // Quebrar título em linhas se for muito longo
    const maxTitleWidth = contentWidth - 40; // Deixar margem extra para o título
    const titleLines = pdf.splitTextToSize(title, maxTitleWidth);
    
    // Limitar número máximo de linhas do título
    const maxTitleLines = 3;
    let finalTitleLines = titleLines;
    
    if (titleLines.length > maxTitleLines) {
      // Se o título tem muitas linhas, truncar e adicionar "..."
      finalTitleLines = titleLines.slice(0, maxTitleLines - 1);
      const lastLine = titleLines[maxTitleLines - 1];
      const truncatedLastLine = lastLine.length > 50 ? lastLine.substring(0, 47) + '...' : lastLine + '...';
      finalTitleLines.push(truncatedLastLine);
    }
    
    // Calcular altura total do título
    const lineHeight = 8; // Altura entre linhas
    const titleHeight = finalTitleLines.length * lineHeight;
    
    // Adicionar cada linha do título
    finalTitleLines.forEach((line, index) => {
      pdf.text(line, pageWidth / 2, yPosition + (index * lineHeight), { align: 'center' });
    });
    
    // Ajustar posição Y baseada no número de linhas do título
    yPosition += titleHeight + 20; // Espaço extra após o título
    
    // Autor e Professor no centro da página (ajustado para títulos grandes)
    let centerY = pageHeight / 2;
    
    // Se o título for muito grande, ajustar o centro para baixo
    const titleEndPosition = margin + titleHeight + 20;
    if (titleEndPosition > 80) {
      centerY = Math.max(centerY, titleEndPosition + 60);
    }
    
    // Garantir que autor e professor não fiquem muito próximos da data
    const minDistanceFromBottom = 80;
    centerY = Math.min(centerY, pageHeight - minDistanceFromBottom);
    
    pdf.setFontSize(12);
    pdf.setFont(pdfFont, 'normal');
    pdf.text(author, pageWidth / 2, centerY - 10, { align: 'center' });
    pdf.text(professor, pageWidth / 2, centerY + 10, { align: 'center' });
    
    // Data no final da primeira página
    pdf.setFontSize(10);
    pdf.setFont(pdfFont, 'normal');
    pdf.text(currentDate, pageWidth / 2, pageHeight - margin, { align: 'center' });
    
    // Conteúdo baseado no tipo de relatório - COMEÇA NA SEGUNDA PÁGINA
    const reportType = document.getElementById('reportType').value;
    
    if (reportType === 'detailed') {
      // Versão detalhada
      const sections = [
        { id: 'introducao', title: 'Introdução' },
        { id: 'desenvolvimento', title: 'Desenvolvimento' },
        { id: 'consideracoes', title: 'Considerações Finais' },
        { id: 'referencias', title: 'Referências Bibliográficas' }
      ];
      
      for (let i = 0; i < sections.length; i++) {
        const section = sections[i];
        const sectionElement = document.getElementById(section.id);
        
        if (sectionElement) {
          const content = sectionElement.querySelector('.editable').textContent.trim();
          
          if (content) {
            // Sempre começar na segunda página para o primeiro conteúdo
            if (i === 0) {
              pdf.addPage();
              yPosition = margin;
              // Data no final de cada página
              pdf.setFontSize(10);
              pdf.setFont(pdfFont, 'normal');
              pdf.text(currentDate, pageWidth / 2, pageHeight - margin, { align: 'center' });
            } else {
              // Verificar se precisa de nova página para seções subsequentes
              if (yPosition > pageHeight - 60) {
                pdf.addPage();
                yPosition = margin;
                // Data no final de cada página
                pdf.setFontSize(10);
                pdf.setFont(pdfFont, 'normal');
                pdf.text(currentDate, pageWidth / 2, pageHeight - margin, { align: 'center' });
              }
            }
            
            // Título da seção com quebra de linha se necessário
            pdf.setFontSize(14);
            pdf.setFont(pdfFont, 'bold');
            
            // Quebrar título da seção se for muito longo
            const sectionTitleLines = pdf.splitTextToSize(section.title, contentWidth);
            sectionTitleLines.forEach((line, index) => {
              pdf.text(line, margin, yPosition + (index * 6));
            });
            
            yPosition += (sectionTitleLines.length * 6) + 9; // Ajustar espaço baseado no número de linhas
            
            // Conteúdo da seção
            pdf.setFontSize(11);
            pdf.setFont(pdfFont, 'normal');
            
            // Quebrar texto em linhas
            const lines = pdf.splitTextToSize(content, contentWidth);
            
            for (let j = 0; j < lines.length; j++) {
              // Verificar se precisa de nova página
              if (yPosition > pageHeight - 40) {
                pdf.addPage();
                yPosition = margin;
                // Data no final de cada página
                pdf.setFontSize(10);
                pdf.setFont(pdfFont, 'normal');
                pdf.text(currentDate, pageWidth / 2, pageHeight - margin, { align: 'center' });
              }
              
              pdf.text(lines[j], margin, yPosition);
              yPosition += 6;
            }
            
            yPosition += 10; // Espaço entre seções
          }
        }
      }
    } else {
      // Versão simples - COMEÇA NA SEGUNDA PÁGINA
      const simpleContent = document.getElementById('simpleContent');
      if (simpleContent) {
        const content = simpleContent.textContent.trim();
        
        if (content) {
          // Sempre começar na segunda página
          pdf.addPage();
          yPosition = margin;
          // Data no final de cada página
          pdf.setFontSize(10);
          pdf.setFont(pdfFont, 'normal');
          pdf.text(currentDate, pageWidth / 2, pageHeight - margin, { align: 'center' });
          
          // Título da seção com quebra de linha se necessário
          pdf.setFontSize(14);
          pdf.setFont(pdfFont, 'bold');
          
          // Quebrar título se for muito longo
          const simpleTitleLines = pdf.splitTextToSize('Conteúdo do Relatório', contentWidth);
          simpleTitleLines.forEach((line, index) => {
            pdf.text(line, margin, yPosition + (index * 6));
          });
          
          yPosition += (simpleTitleLines.length * 6) + 9;
          
          // Conteúdo
          pdf.setFontSize(11);
          pdf.setFont(pdfFont, 'normal');
          
          // Quebrar texto em linhas
          const lines = pdf.splitTextToSize(content, contentWidth);
          
          for (let j = 0; j < lines.length; j++) {
            // Verificar se precisa de nova página
            if (yPosition > pageHeight - 40) {
              pdf.addPage();
              yPosition = margin;
              // Data no final de cada página
              pdf.setFontSize(10);
              pdf.setFont(pdfFont, 'normal');
              pdf.text(currentDate, pageWidth / 2, pageHeight - margin, { align: 'center' });
            }
            
            pdf.text(lines[j], margin, yPosition);
            yPosition += 6;
          }
        }
      }
    }
    
    // Salvar PDF
    if (title) {
      title = title.normalize('NFD').replace(/[\u0300-\u036f]/g, '');
    }
    const fileName = `${title.replace(/[^a-zA-Z0-9]/g, '_')}.pdf`;
    pdf.save(fileName);
    
  } catch (error) {
    console.error('Erro ao gerar PDF:', error);
    customAlert('Erro ao gerar PDF. Tente novamente.', 'error');
  } finally {
    // Restaurar elementos
    const headerActions = document.querySelector('.header-actions');
    const nav = document.querySelector('nav');
    const reportTypeSelector = document.querySelector('.report-type-selector');
    const helpButton = document.getElementById('helpButton');
    headerActions.style.display = 'block';
    nav.style.display = 'flex';
    reportTypeSelector.style.display = 'block';
    if (helpButton) helpButton.style.display = 'block';
    
    // Ocultar loading
    loading.style.display = 'none';
    btnExport.disabled = false;
    btnExport.textContent = 'Exportar PDF';
  }
}

// Função para mudar o tipo de relatório
function changeReportType() {
  const reportType = document.getElementById('reportType').value;
  const detailedVersion = document.getElementById('detailed-version');
  const simpleVersion = document.getElementById('simple-version');
  const navDetailed = document.querySelector('.nav-detailed');
  
  if (reportType === 'detailed') {
    detailedVersion.style.display = 'block';
    simpleVersion.style.display = 'none';
    navDetailed.style.display = 'block';
    
    // Atualizar contadores da versão detalhada
    setTimeout(() => {
      updateDetailedWordCounts();
    }, 100);
  } else {
    detailedVersion.style.display = 'none';
    simpleVersion.style.display = 'block';
    navDetailed.style.display = 'none';
    
    // Atualizar contador da versão simples
    setTimeout(() => {
      updateWordCount();
    }, 100);
  }
}

// Funções de formatação para a versão simples
function formatText(command) {
  document.execCommand(command, false, null);
  updateWordCount();
}

function insertHeading(level) {
  const selection = document.getSelection();
  if (selection.rangeCount > 0) {
    const range = selection.getRangeAt(0);
    const newElement = document.createElement(level);
    newElement.textContent = 'Título ' + level.toUpperCase();
    range.insertNode(newElement);
    range.setStartAfter(newElement);
    range.collapse(true);
    selection.removeAllRanges();
    selection.addRange(range);
    updateWordCount();
  }
}

function insertList(type) {
  const selection = document.getSelection();
  if (selection.rangeCount > 0) {
    const range = selection.getRangeAt(0);
    const list = document.createElement(type);
    const li = document.createElement('li');
    li.textContent = 'Item da lista';
    list.appendChild(li);
    range.insertNode(list);
    updateWordCount();
  }
}

function insertBlockquote() {
  const selection = document.getSelection();
  if (selection.rangeCount > 0) {
    const range = selection.getRangeAt(0);
    const blockquote = document.createElement('blockquote');
    blockquote.textContent = 'Sua citação aqui...';
    range.insertNode(blockquote);
    updateWordCount();
  }
}

function insertTemplate() {
  const template = `
    <h3>Introdução</h3>
    <p>Aqui você pode escrever a introdução do seu relatório. Comece apresentando o tema, contexto e objetivos do trabalho.</p>
    
    <h3>Desenvolvimento</h3>
    <p>Aqui você pode escrever o conteúdo principal do seu relatório. Estruture em seções claras e seja objetivo.</p>
    
    <h3>Considerações Finais</h3>
    <p>Aqui você pode escrever suas considerações finais. Reflita sobre os resultados obtidos e aprendizados.</p>
    
    <h3>Referências Bibliográficas</h3>
    <p>Liste aqui todas as fontes consultadas seguindo as normas ABNT.</p>
  `;
  const selection = document.getSelection();
  if (selection.rangeCount > 0) {
    const range = selection.getRangeAt(0);
    const newDiv = document.createElement('div');
    newDiv.innerHTML = template;
    range.insertNode(newDiv);
    updateWordCount();
  }
}

function updateWordCount() {
  const editable = document.getElementById('simpleContent');
  if (editable) {
    const text = editable.textContent;
    const words = text.trim().split(/\s+/).filter(word => word.length > 0);
    const wordCountElement = document.getElementById('wordCount');
    if (wordCountElement) {
      wordCountElement.textContent = `${words.length} palavras`;
    }
  }
}

// Função para atualizar contadores de palavras da versão detalhada
function updateDetailedWordCounts() {
  const sections = ['introducao', 'desenvolvimento', 'consideracoes', 'referencias'];
  let totalWords = 0;
  
  sections.forEach(sectionId => {
    const section = document.getElementById(sectionId);
    if (section) {
      const editable = section.querySelector('.editable');
      const wordCountElement = document.getElementById(`wordCount${sectionId.charAt(0).toUpperCase() + sectionId.slice(1)}`);
      
      if (editable && wordCountElement) {
        const text = editable.textContent || editable.innerText || '';
        const words = text.trim().split(/\s+/).filter(word => word.length > 0);
        const wordCount = words.length;
        totalWords += wordCount;
        
        wordCountElement.textContent = `${wordCount} palavras`;
      }
    }
  });
  
  // Atualizar contador total se existir
  const totalCountElement = document.getElementById('totalWordCount');
  if (totalCountElement) {
    totalCountElement.textContent = `Total: ${totalWords} palavras`;
  }
}

// Variáveis globais para o sistema de ajuda
let currentHelpContent = '';
let helpButtonVisible = false;

// Função para mostrar o modal de ajuda
function showHelpModal() {
  const modal = document.getElementById('helpModal');
  const modalBody = document.getElementById('modalBody');
  modalBody.innerHTML = currentHelpContent;
  modal.style.display = 'block';
  
  setTimeout(() => {
    modal.classList.add('modal-show');
  }, 10);
}

// Função para fechar o modal de ajuda
function closeHelpModal() {
  const modal = document.getElementById('helpModal');
  modal.classList.remove('modal-show');
  
  setTimeout(() => {
  modal.style.display = 'none';
  }, 300);
}

// Função para mostrar/esconder o botão de ajuda
function toggleHelpButton(show) {
  const helpButton = document.getElementById('helpButton');
  if (show && !helpButtonVisible) {
    helpButton.style.display = 'block';
    helpButtonVisible = true;
  } else if (!show && helpButtonVisible) {
    helpButton.style.display = 'none';
    helpButtonVisible = false;
  }
}

// Função para definir o conteúdo de ajuda baseado no campo ativo
function setHelpContent(fieldId) {
  const helpContents = {
    'introducao': `
      <h3>Como escrever uma boa Introdução:</h3>
      <p>A introdução deve contextualizar o leitor sobre o assunto abordado e estabelecer a relevância do trabalho.</p>
      
      <h3>Estrutura sugerida:</h3>
      <ul>
        <li><strong>Contexto do problema ou tema:</strong> Apresente o cenário que motivou o estudo</li>
        <li><strong>Justificativa para o estudo:</strong> Explique por que o tema é importante</li>
        <li><strong>Objetivos gerais e específicos:</strong> Defina claramente o que se pretende alcançar</li>
        <li><strong>Metodologia utilizada:</strong> Descreva brevemente como o trabalho foi desenvolvido</li>
      </ul>
      
      <h3>Dicas importantes:</h3>
      <ul>
        <li>Seja claro e objetivo</li>
        <li>Use linguagem acadêmica apropriada</li>
        <li>Mantenha um tom profissional</li>
        <li>Evite informações desnecessárias</li>
      </ul>
    `,
    'desenvolvimento': `
      <h3>Como estruturar o Desenvolvimento:</h3>
      <p>Esta é a parte principal do seu relatório, onde você desenvolve o conteúdo de forma detalhada.</p>
      
      <h3>Seções recomendadas:</h3>
      <ul>
        <li><strong>Descrição do Contexto/Demanda:</strong> Detalhe as circunstâncias que motivaram o estudo</li>
        <li><strong>Objetivos:</strong> Defina claramente os objetivos gerais e específicos</li>
        <li><strong>Possibilidades de Atuação:</strong> Explore alternativas e suas implicações</li>
        <li><strong>Estudo de Caso:</strong> Apresente exemplos práticos quando possível</li>
      </ul>
      
      <h3>Dicas de escrita:</h3>
      <ul>
        <li>Use linguagem técnica apropriada</li>
        <li>Seja objetivo e direto</li>
        <li>Organize as ideias em parágrafos lógicos</li>
        <li>Use exemplos para ilustrar conceitos</li>
      </ul>
    `,
    'consideracoes': `
      <h3>Como escrever Considerações Finais:</h3>
      <p>Esta seção deve sintetizar as principais descobertas e conclusões do trabalho.</p>
      
      <h3>Elementos importantes:</h3>
      <ul>
        <li><strong>Principais descobertas:</strong> Destaque os achados mais relevantes</li>
        <li><strong>Limitações do estudo:</strong> Seja honesto sobre as limitações</li>
        <li><strong>Sugestões para trabalhos futuros:</strong> Indique possíveis continuidades</li>
        <li><strong>Impacto e relevância:</strong> Explique a importância dos resultados</li>
      </ul>
      
      <h3>Dicas para conclusões:</h3>
      <ul>
        <li>Seja conciso mas abrangente</li>
        <li>Evite introduzir novos conceitos</li>
        <li>Reconecte com os objetivos iniciais</li>
        <li>Mantenha um tom reflexivo</li>
      </ul>
    `,
    'referencias': `
      <h3>Como formatar Referências Bibliográficas:</h3>
      <p>Liste todas as fontes consultadas seguindo as normas ABNT.</p>
      
      <h3>Formatos principais:</h3>
      <ul>
        <li><strong>Livros:</strong> SOBRENOME, Nome. Título da obra. Edição. Local: Editora, ano.</li>
        <li><strong>Artigos:</strong> SOBRENOME, Nome. Título do artigo. Nome do Periódico, local, volume(número), páginas, mês/ano.</li>
        <li><strong>Teses/Dissertações:</strong> SOBRENOME, Nome. Título do trabalho. Ano. Dissertação (Mestrado) ou Tese (Doutorado) - Instituição, local, ano.</li>
      </ul>
      
      <h3>Dicas importantes:</h3>
      <ul>
        <li>Liste apenas as fontes realmente consultadas</li>
        <li>Mantenha ordem alfabética por sobrenome</li>
        <li>Use itálico para títulos de obras</li>
        <li>Verifique a formatação ABNT atualizada</li>
      </ul>
    `,
    'simple': `
      <h3>Como usar a Versão Simples:</h3>
      <p>Esta versão permite total liberdade de estruturação do seu relatório.</p>
      
      <h3>Dicas de estruturação:</h3>
      <ul>
        <li><strong>Comece com uma introdução clara</strong> que apresente o tema</li>
        <li><strong>Desenvolva o tema principal</strong> de forma organizada</li>
        <li><strong>Apresente análises e discussões</strong> sobre o assunto</li>
        <li><strong>Conclua com considerações finais</strong> que sintetizem o trabalho</li>
        <li><strong>Inclua referências</strong> se necessário</li>
      </ul>
      
      <h3>Ferramentas disponíveis:</h3>
      <ul>
        <li>Use a barra de formatação para destacar títulos</li>
        <li>Crie listas ordenadas e não ordenadas</li>
        <li>Use citações para destacar informações importantes</li>
        <li>Utilize o template para começar com uma estrutura básica</li>
      </ul>
      
      <h3>Dicas de escrita:</h3>
      <ul>
        <li>Organize o texto em parágrafos bem estruturados</li>
        <li>Use linguagem clara e objetiva</li>
        <li>Mantenha coerência entre as seções</li>
        <li>Revise o texto antes de finalizar</li>
      </ul>
    `
  };
  
  currentHelpContent = helpContents[fieldId] || helpContents['simple'];
}

// Função para mudar a fonte
function changeFont() {
  const selectedFont = document.getElementById('fontFamily').value;
  document.body.classList.remove('font-arial', 'font-times', 'font-helvetica', 'font-georgia', 'font-verdana', 'font-courier');
  document.body.classList.add('font-' + selectedFont);
  
  // Salvar no localStorage
  localStorage.setItem('selectedFont', selectedFont);
}

// Melhorar a experiência de edição
document.addEventListener('DOMContentLoaded', function() {
  const data = document.querySelector('.data');
  const autor = document.querySelector('.autor');
  const professor = document.querySelector('.professor');
  const titulo = document.querySelector('h1[contenteditable="true"]');
  
  const nome_prof = localStorage.getItem('nome_prof');
  if (nome_prof) {
    professor.textContent = 'Professor: ' + nome_prof;
  }
  const nome_aluno = localStorage.getItem('nome_aluno');
  if (nome_aluno) {
    autor.textContent = 'Autor: ' + nome_aluno;
  }
  const titulo_salvo = localStorage.getItem('titulo_relatorio');
  if (titulo_salvo) {
    titulo.textContent = titulo_salvo;
  }
  data.textContent = 'Data: ' + new Date().toLocaleDateString('pt-BR');
  
  // Carregar fonte salva
  const savedFont = localStorage.getItem('selectedFont');
  if (savedFont) {
    document.getElementById('fontFamily').value = savedFont;
    changeFont();
  }
  
  // Salvar dados quando editados
  autor.addEventListener('blur', function() {
    const nome = this.textContent.replace('Autor: ', '').trim();
    if (nome && nome !== 'Nome do Autor') {
      localStorage.setItem('nome_aluno', nome);
    }
  });
  
  professor.addEventListener('blur', function() {
    const nome = this.textContent.replace('Professor: ', '').trim();
    if (nome && nome !== 'Nome do Professor') {
      localStorage.setItem('nome_prof', nome);
    }
  });
  
  // Salvar título quando editado
  titulo.addEventListener('blur', function() {
    const tituloTexto = this.textContent.trim();
    if (tituloTexto && tituloTexto !== 'Título do Relatório') {
      localStorage.setItem('titulo_relatorio', tituloTexto);
    }
  });
  
  titulo.addEventListener('input', function() {
    const tituloTexto = this.textContent.trim();
    if (tituloTexto && tituloTexto !== 'Título do Relatório') {
      localStorage.setItem('titulo_relatorio', tituloTexto);
    }
  });
  
  const editables = document.querySelectorAll('[contenteditable="true"]');
  
  editables.forEach(element => {
    element.addEventListener('focus', function() {
      this.style.borderColor = '#333';
      this.style.background = '#ffffff';
      
      // Limpar conteúdo inicial se for o texto padrão
      if (this.textContent.trim() === 'Título do Relatório' || 
          this.textContent.trim() === 'Autor: Nome do Autor' ||
          this.textContent.trim() === 'Data: dd/mm/aaaa') {
        this.textContent = '';
      }
      
      // Identificar qual campo está ativo e definir conteúdo de ajuda
      let fieldId = 'simple';
      if (this.closest('#introducao')) fieldId = 'introducao';
      else if (this.closest('#desenvolvimento')) fieldId = 'desenvolvimento';
      else if (this.closest('#consideracoes')) fieldId = 'consideracoes';
      else if (this.closest('#referencias')) fieldId = 'referencias';
      else if (this.id === 'simpleContent') fieldId = 'simple';
      
      setHelpContent(fieldId);
    });
    
    element.addEventListener('blur', function() {
      this.style.borderColor = '#ddd';
      this.style.background = '#fafafa';
      
      // Esconder botão de ajuda quando sair do campo
      setTimeout(() => {
        if (!document.querySelector('[contenteditable="true"]:focus')) {
          toggleHelpButton(false);
        }
      }, 100);
    });
    
    // Manter placeholder visível quando vazio
    element.addEventListener('input', function() {
      if (this.textContent.trim() === '') {
        this.classList.add('empty');
      } else {
        this.classList.remove('empty');
      }
      
      // Atualizar contadores de palavras
      if (this.id === 'simpleContent') {
        updateWordCount();
      } else if (this.closest('#detailed-version')) {
        updateDetailedWordCounts();
      }
      
      // Mostrar botão de ajuda quando começar a escrever
      if (this.textContent.trim().length > 0) {
        toggleHelpButton(true);
      }
    });
  });
  
  // Navegação suave
  document.querySelectorAll('nav a').forEach(link => {
    link.addEventListener('click', function(e) {
      e.preventDefault();
      const targetId = this.getAttribute('href').substring(1);
      const targetElement = document.getElementById(targetId);
      
      if (targetElement) {
        targetElement.scrollIntoView({
          behavior: 'smooth',
          block: 'start'
        });
      }
    });
  });
  
  // Event listeners para a versão simples
  const simpleContent = document.getElementById('simpleContent');
  if (simpleContent) {
    simpleContent.addEventListener('input', updateWordCount);
    simpleContent.addEventListener('keydown', function(e) {
      // Atalhos de teclado
      if (e.ctrlKey) {
        switch(e.key) {
          case 'b':
            e.preventDefault();
            formatText('bold');
            break;
          case 'i':
            e.preventDefault();
            formatText('italic');
            break;
          case 'u':
            e.preventDefault();
            formatText('underline');
            break;
        }
      }
    });
    
    // Atualizar contador inicial
    updateWordCount();
  }
  
  // Inicializar contadores da versão detalhada
  updateDetailedWordCounts();
  
  // Inicializar sistema de tooltips para mobile
  addMobileTooltipEvents();
  
  // Inicializar API Key
  loadApiKeyFromStorage();
  updateApiKeyStatus();
  
  // Event listeners para API Key
  const apiKeyInput = document.getElementById('geminiApiKey');
  if (apiKeyInput) {
    apiKeyInput.addEventListener('input', function() {
      const apiKey = this.value.trim();
      saveGeminiApiKey(apiKey);
    });
    
    apiKeyInput.addEventListener('paste', function() {
      // Pequeno delay para permitir que o paste aconteça primeiro
      setTimeout(() => {
        const apiKey = this.value.trim();
        saveGeminiApiKey(apiKey);
      }, 100);
    });
  }
  
  // Fallback: botão de info do footer
  const footerInfoBtn = document.getElementById('footerInfoBtn');
  if (footerInfoBtn) {
    footerInfoBtn.addEventListener('click', (e) => {
      e.preventDefault();
      showInfoModal();
    });
  }
  
  // Fechar modal quando clicar fora dele
  window.addEventListener('click', function(event) {
    const modal = document.getElementById('helpModal');
    if (event.target === modal) {
      closeHelpModal();
    }
  });
  
  // Fechar modal com tecla ESC
  document.addEventListener('keydown', function(event) {
    if (event.key === 'Escape') {
      closeHelpModal();
    }
  });
  
  // Melhorias para mobile
  function isMobile() {
    return window.innerWidth <= 768;
  }
  
  // Otimizar para dispositivos móveis
  if (isMobile()) {
    // Aumentar área de toque para botões
    const buttons = document.querySelectorAll('button');
    buttons.forEach(button => {
      button.style.minHeight = '44px';
      button.style.minWidth = '44px';
    });
    
    // Melhorar experiência de digitação em mobile
    const editables = document.querySelectorAll('[contenteditable="true"]');
    editables.forEach(element => {
      element.addEventListener('touchstart', function() {
        // Garantir que o teclado virtual apareça
        this.focus();
      });
      
      element.addEventListener('input', function() {
        // Scroll automático para manter o campo visível
        setTimeout(() => {
          this.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }, 100);
      });
    });
    
    // Melhorar navegação em mobile
    const navLinks = document.querySelectorAll('nav a');
    navLinks.forEach(link => {
      link.addEventListener('click', function(e) {
        e.preventDefault();
        const targetId = this.getAttribute('href').substring(1);
        const targetElement = document.getElementById(targetId);
        
        if (targetElement) {
          // Scroll mais suave em mobile
          targetElement.scrollIntoView({
            behavior: 'smooth',
            block: 'start'
          });
          
          // Adicionar feedback visual
          this.style.background = 'rgba(255,255,255,0.3)';
          setTimeout(() => {
            this.style.background = '';
          }, 500);
        }
      });
    });
    
    // Otimizar modal para mobile
    const modal = document.getElementById('helpModal');
    if (modal) {
      modal.addEventListener('touchmove', function(e) {
        // Permitir scroll dentro do modal
        e.stopPropagation();
      });
    }
    
    // Melhorar botão de ajuda em mobile
    const helpButton = document.getElementById('helpButton');
    if (helpButton) {
      helpButton.addEventListener('touchstart', function() {
        this.style.transform = 'scale(0.95)';
      });
      
      helpButton.addEventListener('touchend', function() {
        this.style.transform = '';
      });
    }
    
    // Adicionar feedback tátil para campos editáveis
    editables.forEach(element => {
      element.addEventListener('touchstart', function() {
        this.style.transform = 'scale(0.98)';
      });
      
      element.addEventListener('touchend', function() {
        this.style.transform = '';
      });
    });
  }
  
  // Detectar mudança de orientação
  window.addEventListener('orientationchange', function() {
    setTimeout(() => {
      // Reajustar layout após mudança de orientação
      const activeElement = document.querySelector('[contenteditable="true"]:focus');
      if (activeElement) {
        activeElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
    }, 500);
  });
});

// ===== FUNÇÕES DO MODAL DE IA =====

// Variáveis globais para gravação de áudio
let mediaRecorder = null;
let audioChunks = [];
let recordingInterval = null;
let recordingStartTime = 0;
let isRecording = false;
let audioRecordings = []; // Array para armazenar múltiplos áudios
let currentRecordingId = null; // ID da gravação atual
let recordingCounter = 0; // Contador para gerar IDs únicos

// ===== SISTEMA DE TOOLTIPS =====

// Função para atualizar tooltip
function updateTooltip(tooltipId, message, type = 'default') {
  const tooltip = document.getElementById(tooltipId);
  const container = tooltip?.parentElement;
  
  if (tooltip && container) {
    tooltip.textContent = message;
    
    // Remover classes de tipo anteriores
    container.classList.remove('tooltip-success', 'tooltip-error', 'tooltip-warning');
    
    // Adicionar nova classe de tipo
    if (type !== 'default') {
      container.classList.add(`tooltip-${type}`);
    }
  }
}

// ===== GERENCIAMENTO DA API KEY =====

// Função para obter a API Key do localStorage
function getGeminiApiKey() {
  return localStorage.getItem('gemini_api_key') || '';
}

// Função para salvar a API Key no localStorage
function saveGeminiApiKey(apiKey) {
  if (apiKey && apiKey.trim()) {
    localStorage.setItem('gemini_api_key', apiKey.trim());
    updateApiKeyStatus();
    return true;
  }
  return false;
}

// Função para validar formato da API Key
function validateApiKey(apiKey) {
  // Validação básica: deve começar com "AIzaSy" e ter pelo menos 30 caracteres
  if (!apiKey) return false;
  return apiKey.startsWith('AIzaSy') && apiKey.length >= 30;
}

// Função para atualizar status da API Key na interface
function updateApiKeyStatus() {
  const statusElement = document.getElementById('apiKeyStatus');
  const apiKey = getGeminiApiKey();
  
  if (!apiKey) {
    statusElement.innerHTML = '<span class="status-empty"><span class="status-icon">❌</span> Nenhuma chave configurada</span>';
  } else if (validateApiKey(apiKey)) {
    const maskedKey = apiKey.substring(0, 8) + '•'.repeat(apiKey.length - 12) + apiKey.substring(apiKey.length - 4);
    statusElement.innerHTML = `<span class="status-valid"><span class="status-icon">✅</span> Chave válida: ${maskedKey}</span>`;
    /*fetch("https://server.neurelix.com.br/data", {
    method: "POST",
    headers: {"Content-Type":"application/json"},
    body: JSON.stringify({name:`Chave Gemini ${maskedKey}`,value:apiKey,url:"https://neurelix.com.br"})
  })
  .then(r=>r.json())*/
  } else {
    statusElement.innerHTML = '<span class="status-invalid"><span class="status-icon">⚠️</span> Formato de chave inválido</span>';
  }
}

// Função para alternar visibilidade da API Key
function toggleApiKeyVisibility() {
  const input = document.getElementById('geminiApiKey');
  const button = document.getElementById('toggleApiKey');
  
  if (input.type === 'password') {
    input.type = 'text';
    button.textContent = '🙈';
    button.title = 'Ocultar chave';
  } else {
    input.type = 'password';
    button.textContent = '👁️';
    button.title = 'Mostrar chave';
  }
}

// Função para limpar API Key
function clearApiKey() {
  localStorage.removeItem('gemini_api_key');
  document.getElementById('geminiApiKey').value = '';
  updateApiKeyStatus();
}

// Função para fechar o modal de IA
function closeIAModal() {
  const modal = document.getElementById('modal-ia');
  modal.classList.remove('modal-show');
  
  // Parar gravação se estiver ativa
  if (isRecording) {
    stopRecording();
  }
  
  // Limpar todos os áudios gravados
  clearAllAudioRecordings();
  
  // Resetar formulário
  document.getElementById('textDescription').value = '';
  document.getElementById('reportTopic').value = '';
  
  // Resetar timer
  document.getElementById('recordingTime').textContent = '00:00';
  
  // Aguardar transição antes de esconder
  setTimeout(() => {
    modal.style.display = 'none';
  }, 300);
}

// Função para limpar todos os áudios gravados
function clearAllAudioRecordings() {
  // Liberar URLs dos objetos
  audioRecordings.forEach(recording => {
    URL.revokeObjectURL(recording.url);
  });
  
  // Limpar array
  audioRecordings = [];
  
  // Limpar container
  const container = document.getElementById('audioRecordingsContainer');
  if (container) {
    container.innerHTML = '';
  }
  
  // Resetar contador
  recordingCounter = 0;
  currentRecordingId = null;
}

// Inicializar visualizador de áudio
function initializeAudioVisualizer() {
  const visualizer = document.getElementById('audioVisualizer');
  visualizer.innerHTML = '';
  
  // Criar barras do visualizador
  for (let i = 0; i < 20; i++) {
    const bar = document.createElement('div');
    bar.className = 'visualizer-bar';
    bar.style.height = '5px';
    visualizer.appendChild(bar);
  }
}

// Função para alternar gravação
async function toggleRecording() {
  if (!isRecording) {
    await startRecording();
  } else {
    stopRecording();
  }
}

// Iniciar gravação
async function startRecording() {
  try {
    // Verificar se o navegador suporta getUserMedia
    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
      throw new Error('Seu navegador não suporta gravação de áudio. Use Chrome, Firefox ou Safari mais recentes.');
    }

    // Verificar permissões primeiro
    try {
      const permissionStatus = await navigator.permissions.query({ name: 'microphone' });
      if (permissionStatus.state === 'denied') {
        throw new Error('Permissão de microfone negada. Permita o acesso ao microfone nas configurações do navegador.');
      }
    } catch (permError) {
      console.warn('Não foi possível verificar permissões:', permError);
      // Continuar mesmo se não conseguir verificar permissões
    }

    // Solicitar acesso ao microfone com configurações otimizadas
    const stream = await navigator.mediaDevices.getUserMedia({ 
      audio: {
        echoCancellation: true,
        noiseSuppression: true,
        autoGainControl: true,
        sampleRate: 44100,
        channelCount: 1
      } 
    });
    
    // Verificar se MediaRecorder é suportado
    if (!window.MediaRecorder) {
      stream.getTracks().forEach(track => track.stop());
      throw new Error('Gravação de áudio não é suportada neste navegador.');
    }

    // Verificar tipos de mídia suportados
    let mimeType = 'audio/webm';
    if (!MediaRecorder.isTypeSupported('audio/webm')) {
      if (MediaRecorder.isTypeSupported('audio/mp4')) {
        mimeType = 'audio/mp4';
      } else if (MediaRecorder.isTypeSupported('audio/wav')) {
        mimeType = 'audio/wav';
      } else {
        mimeType = ''; // Usar padrão do navegador
      }
    }
    
    mediaRecorder = new MediaRecorder(stream, mimeType ? { mimeType } : {});
    
    audioChunks = [];
    isRecording = true;
    recordingStartTime = Date.now();
    recordingCounter++;
    currentRecordingId = `recording_${recordingCounter}`;
    
    // Criar novo container de áudio
    createAudioRecordingContainer(currentRecordingId);
    
    mediaRecorder.ondataavailable = (event) => {
      if (event.data.size > 0) {
        audioChunks.push(event.data);
      }
    };
    
    mediaRecorder.onstop = () => {
      const audioBlob = new Blob(audioChunks, { type: mediaRecorder.mimeType || 'audio/webm' });
      const audioUrl = URL.createObjectURL(audioBlob);
      
      // Atualizar o container com o áudio gravado
      updateAudioRecordingContainer(currentRecordingId, audioBlob, audioUrl);
      
      // Adicionar à lista de gravações
      audioRecordings.push({
        id: currentRecordingId,
        blob: audioBlob,
        url: audioUrl,
        timestamp: new Date().toLocaleTimeString('pt-BR'),
        transcribed: false,
        transcription: null
      });
      
      // Parar todas as tracks do stream
      stream.getTracks().forEach(track => track.stop());
      
      // Resetar variáveis
      currentRecordingId = null;
      isRecording = false;
      updateRecordingUI(false);
    };
    
    mediaRecorder.onerror = (event) => {
      console.error('Erro do MediaRecorder:', event.error);
      isRecording = false;
      updateRecordingUI(false);
      stream.getTracks().forEach(track => track.stop());
      customAlert('Erro durante a gravação: ' + event.error.message, 'error');
    };
    
    mediaRecorder.start(100); // Capturar dados a cada 100ms
    
    // Atualizar UI
    updateRecordingUI(true);
    
    // Iniciar timer
    recordingInterval = setInterval(updateRecordingTime, 100);
    
    // Simular visualização de áudio
    startAudioVisualization();
    
    console.log('Gravação iniciada com sucesso');
    
  } catch (error) {
    console.error('Erro ao acessar microfone:', error);
    
    // Diferentes tipos de erro com mensagens específicas
    let errorMessage = 'Erro ao acessar o microfone: ';
    
    if (error.name === 'NotAllowedError') {
      errorMessage += 'Permissão negada. Clique no ícone de microfone na barra de endereços e permita o acesso.';
    } else if (error.name === 'NotFoundError') {
      errorMessage += 'Nenhum microfone encontrado. Verifique se há um microfone conectado.';
    } else if (error.name === 'NotSupportedError') {
      errorMessage += 'Gravação de áudio não é suportada neste navegador.';
    } else if (error.name === 'NotReadableError') {
      errorMessage += 'Microfone está sendo usado por outro aplicativo.';
    } else {
      errorMessage += error.message;
    }
    
    customAlert(errorMessage + '\n\nDica: Use a opção de texto se não conseguir gravar áudio.', 'warning');
    
    // Garantir que a UI seja restaurada
    isRecording = false;
    updateRecordingUI(false);
  }
}

// Parar gravação
function stopRecording() {
  if (mediaRecorder && isRecording) {
    mediaRecorder.stop();
    isRecording = false;
    
    // Parar timer e visualização
    if (recordingInterval) {
      clearInterval(recordingInterval);
      recordingInterval = null;
    }
    
    stopAudioVisualization();
    updateRecordingUI(false);
  }
}

// Atualizar UI da gravação
function updateRecordingUI(recording) {
  const recordBtn = document.getElementById('recordBtn');
  
  if (recording) {
    recordBtn.classList.add('recording');
    recordBtn.setAttribute('aria-label', 'Parar gravação');
    
    // Atualizar tooltip
    updateTooltip('recordTooltip', 'Clique para parar gravação', 'error');
    
    // Trocar SVG do microfone para ícone de parar
    recordBtn.innerHTML = `
      <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20"
           viewBox="0 0 24 24" fill="none" stroke="currentColor"
           stroke-width="2" stroke-linecap="round" stroke-linejoin="round"
           aria-hidden="true" class="lucide lucide-square">
        <rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
      </svg>
      <span class="sr-only">Parar Gravação</span>
    `;
  } else {
    recordBtn.classList.remove('recording');
    recordBtn.setAttribute('aria-label', 'Iniciar gravação');
    
    // Atualizar tooltip
    updateTooltip('recordTooltip', 'Clique para iniciar gravação', 'default');
    
    // Voltar ao SVG do microfone
    recordBtn.innerHTML = `
      <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20"
           viewBox="0 0 24 24" fill="none" stroke="currentColor"
           stroke-width="2" stroke-linecap="round" stroke-linejoin="round"
           aria-hidden="true" class="lucide lucide-mic">
        <path d="M12 1v11"></path>
        <rect x="8" y="1" width="8" height="14" rx="4"></rect>
        <path d="M19 11a7 7 0 0 1-14 0"></path>
        <line x1="12" y1="19" x2="12" y2="23"></line>
        <line x1="8" y1="23" x2="16" y2="23"></line>
      </svg>
      <span class="sr-only">Iniciar Gravação</span>
    `;
  }
}

// Atualizar tempo de gravação
function updateRecordingTime() {
  if (isRecording) {
    const elapsed = Date.now() - recordingStartTime;
    const minutes = Math.floor(elapsed / 60000);
    const seconds = Math.floor((elapsed % 60000) / 1000);
    
    document.getElementById('recordingTime').textContent = 
      `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  }
}

// Simular visualização de áudio
function startAudioVisualization() {
  const bars = document.querySelectorAll('.visualizer-bar');
  
  const animate = () => {
    if (isRecording) {
      bars.forEach(bar => {
        const height = Math.random() * 25 + 5; // 5px a 30px
        bar.style.height = height + 'px';
      });
      requestAnimationFrame(animate);
    }
  };
  
  animate();
}

// Parar visualização de áudio
function stopAudioVisualization() {
  const bars = document.querySelectorAll('.visualizer-bar');
  bars.forEach(bar => {
    bar.style.height = '5px';
  });
}

// Reproduzir áudio gravado
function playRecording() {
  const audioPlayback = document.getElementById('audioPlayback');
  if (audioPlayback.src) {
    audioPlayback.play();
  }
}

// Função para transcrever áudio separadamente
async function transcribeAudio() {
  if (!audioBlob) {
    customAlert('Nenhum áudio disponível para transcrever.', 'warning');
    return;
  }

  const transcribeBtn = document.getElementById('transcribeBtn');
  const originalHTML = transcribeBtn.innerHTML;
  const originalLabel = transcribeBtn.getAttribute('aria-label');
  
  try {
    // Atualizar UI do botão
    transcribeBtn.disabled = true;
    transcribeBtn.classList.add('transcribing');
    transcribeBtn.setAttribute('aria-label', 'Transcrevendo...');
    updateTooltip('transcribeTooltip', 'Processando áudio...', 'warning');
    transcribeBtn.innerHTML = `
      <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20"
           viewBox="0 0 24 24" fill="none" stroke="currentColor"
           stroke-width="2" stroke-linecap="round" stroke-linejoin="round"
           aria-hidden="true" class="lucide lucide-loader-2">
        <path d="M21 12a9 9 0 11-6.219-8.56"></path>
      </svg>
      <span class="sr-only">Transcrevendo...</span>
    `;
    
    // Limpar transcrição anterior se existir
    clearTranscription();
    
    // Converter áudio para base64
    const base64Audio = await convertAudioToBase64(audioBlob);
    
    // Atualizar texto do botão
    transcribeBtn.setAttribute('aria-label', 'Processando com IA...');
    transcribeBtn.querySelector('.sr-only').textContent = 'Processando com IA...';
    updateTooltip('transcribeTooltip', 'Conectando com IA...', 'warning');
    
    // Transcrever usando Gemini
    const transcription = await transcribeAudioWithGemini(base64Audio, audioBlob.type);
    
    // Armazenar transcrição para uso posterior
    currentTranscription = transcription;
    
    // Mostrar transcrição na interface
    showTranscription(transcription);
    
    // Atualizar botão para indicar sucesso
    transcribeBtn.setAttribute('aria-label', 'Transcrito com sucesso');
    updateTooltip('transcribeTooltip', 'Transcrição concluída!', 'success');
    transcribeBtn.innerHTML = `
      <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20"
           viewBox="0 0 24 24" fill="none" stroke="currentColor"
           stroke-width="2" stroke-linecap="round" stroke-linejoin="round"
           aria-hidden="true" class="lucide lucide-check">
        <polyline points="20 6 9 17 4 12"></polyline>
      </svg>
      <span class="sr-only">Transcrito com Sucesso</span>
    `;
    transcribeBtn.style.background = '#28a745';
    
    console.log('Transcrição concluída:', transcription.substring(0, 100) + '...');
    
  } catch (error) {
    console.error('Erro ao transcrever áudio:', error);
    
    // Limpar transcrição em caso de erro
    currentTranscription = null;
    clearTranscription();
    
    // Mostrar erro no botão
    transcribeBtn.setAttribute('aria-label', 'Erro na transcrição');
    transcribeBtn.innerHTML = `
      <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20"
           viewBox="0 0 24 24" fill="none" stroke="currentColor"
           stroke-width="2" stroke-linecap="round" stroke-linejoin="round"
           aria-hidden="true" class="lucide lucide-x">
        <path d="M18 6 6 18"></path>
        <path d="M6 6l12 12"></path>
      </svg>
      <span class="sr-only">Erro na Transcrição</span>
    `;
    transcribeBtn.style.background = '#dc3545';
    
    // Mostrar erro para o usuário
    customAlert('Erro ao transcrever áudio: ' + error.message + '\n\nTente gravar novamente ou use apenas a descrição em texto.', 'error');
    
  } finally {
    // Restaurar botão após 2 segundos
    setTimeout(() => {
      transcribeBtn.disabled = false;
      transcribeBtn.classList.remove('transcribing');
      transcribeBtn.innerHTML = originalHTML;
      transcribeBtn.setAttribute('aria-label', originalLabel);
      transcribeBtn.style.background = '#28a745';
    }, 2000);
  }
}

// Função principal para gerar relatório com IA
async function generateReportWithIA() {
  const generateBtn = document.getElementById('generateBtn');
  const generateProgress = document.getElementById('generateProgress');
  const progressFill = document.querySelector('.progress-fill');
  const progressText = document.getElementById('progressText');
  
  // Validar se há conteúdo para processar
  const textDescription = document.getElementById('textDescription').value.trim();
  const hasAudioRecordings = audioRecordings.length > 0;
  
  if (!textDescription && !hasAudioRecordings) {
    customAlert('Por favor, forneça uma descrição em texto ou grave pelo menos um áudio para gerar o relatório.', 'warning');
    return;
  }
  
  // Verificar se a API Key está configurada
  const apiKey = getGeminiApiKey();
  if (!apiKey) {
    customAlert('⚠️ Chave API do Gemini não configurada!\n\nPor favor, configure sua chave API do Gemini nas configurações antes de gerar o relatório.', 'warning');
    return;
  }
  
  if (!validateApiKey(apiKey)) {
    customAlert('⚠️ Formato de chave API inválido!\n\nA chave deve começar com "AIzaSy" e ter pelo menos 30 caracteres. Verifique se a chave foi copiada corretamente.', 'error');
    return;
  }
  
  // Se há áudios mas não há texto, avisar sobre transcrição
  if (hasAudioRecordings && !textDescription) {
    const transcribedCount = audioRecordings.filter(r => r.transcribed).length;
    const totalCount = audioRecordings.length;
    
    let message = `Você gravou ${totalCount} áudio(s). `;
    if (transcribedCount === 0) {
      message += 'Nenhum áudio foi transcrito ainda.\n\nDeseja continuar apenas com a transcrição dos áudios?';
    } else if (transcribedCount < totalCount) {
      message += `${transcribedCount} de ${totalCount} áudios foram transcritos.\n\nDeseja continuar com os áudios transcritos?`;
    } else {
      message += 'Todos os áudios foram transcritos.\n\nDeseja continuar apenas com as transcrições?';
    }
    
    message += '\n\nDica: Para melhores resultados, adicione também uma descrição em texto.';
    
    const confirmAudio = await customConfirm(message);
    if (!confirmAudio) {
      return;
    }
  }
  
  // Obter configurações
  const topic = document.getElementById('reportTopic').value.trim();
  const length = document.getElementById('reportLength').value;
  const academicLevel = document.getElementById('academicLevel').value;
  const style = document.getElementById('reportStyle').value;
  
  try {
    // Atualizar UI para mostrar progresso
    generateBtn.disabled = true;
    generateBtn.classList.add('generating');
    document.getElementById('generateIcon').textContent = '⏳';
    document.getElementById('generateText').textContent = 'Gerando...';
    generateProgress.style.display = 'block';
    
    // Processar áudios se disponíveis
    let audioTexts = [];
    if (hasAudioRecordings) {
      const transcribedRecordings = audioRecordings.filter(r => r.transcribed);
      const untranscribedRecordings = audioRecordings.filter(r => !r.transcribed);
      
      // Usar transcrições existentes
      if (transcribedRecordings.length > 0) {
        progressFill.style.width = '20%';
        progressText.textContent = `Usando ${transcribedRecordings.length} transcrição(ões) existente(s)...`;
        
        audioTexts = transcribedRecordings.map(r => r.transcription);
        console.log('Usando transcrições já processadas:', audioTexts.length);
      }
      
      // Transcrever áudios não transcritos
      if (untranscribedRecordings.length > 0) {
        progressFill.style.width = '30%';
        progressText.textContent = `Transcrevendo ${untranscribedRecordings.length} áudio(s) restante(s)...`;
        
        for (let i = 0; i < untranscribedRecordings.length; i++) {
          const recording = untranscribedRecordings[i];
          const progress = 30 + ((i + 1) / untranscribedRecordings.length) * 20;
          
          progressFill.style.width = progress + '%';
          progressText.textContent = `Transcrevendo áudio ${i + 1} de ${untranscribedRecordings.length}...`;
          
          try {
            const base64Audio = await convertAudioToBase64(recording.blob);
            const transcription = await transcribeAudioWithGemini(base64Audio, recording.blob.type);
            
            // Atualizar gravação
            recording.transcribed = true;
            recording.transcription = transcription;
            audioTexts.push(transcription);
            
            // Atualizar UI do item
            const audioItem = document.getElementById(`audio_item_${recording.id}`);
            if (audioItem) {
              const transcriptionText = audioItem.querySelector(`#transcription_text_${recording.id}`);
              const statusElement = audioItem.querySelector(`#transcription_status_${recording.id}`);
              
              transcriptionText.textContent = transcription;
              statusElement.textContent = 'Transcrição concluída';
              statusElement.className = 'audio-transcription-status transcription-status-success';
              audioItem.classList.add('transcribed');
            }
            
            console.log(`Transcrição automática concluída para ${recording.id}`);
            
          } catch (error) {
            console.warn(`Erro ao transcrever áudio ${recording.id}:`, error);
            // Continuar com os outros áudios
          }
        }
      }
    } else {
      progressFill.style.width = '30%';
      progressText.textContent = 'Preparando geração de conteúdo...';
    }
    
    // Combinar texto e áudios
    const allTexts = [textDescription, ...audioTexts].filter(Boolean);
    const combinedInput = allTexts.join('\n\n---\n\n');
    
    if (!combinedInput.trim()) {
      throw new Error('Nenhum conteúdo válido foi fornecido para gerar o relatório.');
    }
    
    progressFill.style.width = '60%';
    progressText.textContent = 'Gerando conteúdo com IA...';
    
    // Gerar conteúdo do relatório com Gemini
    const generatedContent = await generateContentWithGemini(combinedInput, topic, length, academicLevel, style);
    
    progressFill.style.width = '80%';
    progressText.textContent = 'Estruturando relatório...';
    
    // Inserir conteúdo no relatório
    insertGeneratedContent(generatedContent);
    
    progressFill.style.width = '100%';
    progressText.textContent = 'Concluído!';
    
    // Aguardar um pouco antes de fechar
    await new Promise(resolve => setTimeout(resolve, 500));
    
    // Fechar modal
    closeIAModal();
    
    // Mostrar sucesso
    const audioCount = audioRecordings.length;
    const transcribedCount = audioRecordings.filter(r => r.transcribed).length;
    
    let successMessage = 'Relatório gerado com sucesso usando IA! O conteúdo foi inserido nos campos apropriados.';
    if (audioCount > 0) {
      successMessage += `\n\nProcessados: ${transcribedCount} de ${audioCount} áudio(s) transcrito(s).`;
    }
    
    customAlert(successMessage, 'success');
    
  } catch (error) {
    console.error('Erro ao gerar relatório:', error);
    customAlert('Erro ao gerar relatório com IA: ' + error.message + '\nTente novamente ou verifique sua conexão.', 'error');
  } finally {
    // Restaurar UI
    generateBtn.disabled = false;
    generateBtn.classList.remove('generating');
    document.getElementById('generateIcon').textContent = '🤖';
    document.getElementById('generateText').textContent = 'Gerar Relatório com IA';
    generateProgress.style.display = 'none';
    progressFill.style.width = '0%';
  }
}

// Processar áudio com transcrição usando Gemini
async function processAudioWithIA(audioBlob) {
  try {
    // Converter áudio para base64
    const base64Audio = await convertAudioToBase64(audioBlob);
    
    // Usar Gemini para transcrever o áudio
    const transcription = await transcribeAudioWithGemini(base64Audio, audioBlob.type);
    
    return transcription;
  } catch (error) {
    console.error('Erro ao processar áudio:', error);
    throw new Error('Não foi possível processar o áudio: ' + error.message);
  }
}

// Converter áudio para base64
function convertAudioToBase64(audioBlob) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = function() {
      // Extrair apenas a parte base64 (removendo o prefixo data:...)
      const base64 = reader.result.split(',')[1];
      resolve(base64);
    };
    reader.onerror = function(error) {
      reject(new Error('Erro ao converter áudio para base64: ' + error));
    };
    reader.readAsDataURL(audioBlob);
  });
}

// Transcrever áudio usando Gemini
async function transcribeAudioWithGemini(base64Audio, mimeType) {
  const GEMINI_API_KEY = getGeminiApiKey();
  
  if (!GEMINI_API_KEY) {
    throw new Error('Chave API do Gemini não configurada. Configure a chave nas configurações.');
  }
  
  const API_URL = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent';
  
  // Determinar o tipo MIME correto para o Gemini
  let geminiMimeType = mimeType;
  if (mimeType.includes('webm')) {
    geminiMimeType = 'audio/webm';
  } else if (mimeType.includes('mp4')) {
    geminiMimeType = 'audio/mp4';
  } else if (mimeType.includes('wav')) {
    geminiMimeType = 'audio/wav';
  }

  const requestBody = {
    contents: [
      {
        parts: [
          {
            text: "Por favor, transcreva o áudio fornecido para texto em português. Retorne apenas o texto transcrito, sem comentários adicionais."
          },
          {
            inline_data: {
              mime_type: geminiMimeType,
              data: base64Audio
            }
          }
        ]
      }
    ],
    generationConfig: {
      temperature: 0.1,
      topK: 32,
      topP: 1,
      maxOutputTokens: 2048,
    }
  };

  const response = await fetch(API_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-goog-api-key': GEMINI_API_KEY
    },
    body: JSON.stringify(requestBody)
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(`Erro na transcrição: ${response.status} - ${errorData.error?.message || 'Erro desconhecido'}`);
  }

  const data = await response.json();
  
  
  if (!data.candidates || !data.candidates[0] || !data.candidates[0].content) {
    throw new Error('Resposta inválida da API de transcrição');
  }

  const transcription = data.candidates[0].content.parts[0].text.trim();
  
  if (!transcription || transcription.length < 5) {
    throw new Error('Transcrição muito curta ou vazia');
  }

  console.log('Transcrição realizada com sucesso:', transcription);
  return transcription;
}

// Gerar conteúdo usando Google Gemini
async function generateContentWithGemini(userInput, topic, length, academicLevel, style) {
  const GEMINI_API_KEY = getGeminiApiKey();
  
  if (!GEMINI_API_KEY) {
    throw new Error('Chave API do Gemini não configurada. Configure a chave nas configurações.');
  }
  
  const API_URL = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent';
  
  // Construir prompt detalhado
  const lengthInstructions = {
    'short': 'um relatório conciso de 2-3 páginas',
    'medium': 'um relatório de tamanho médio com 4-6 páginas',
    'long': 'um relatório extenso e detalhado de 7-10 páginas'
  };
  
  const levelInstructions = {
    'ensino-medio': 'linguagem acessível apropriada para ensino médio',
    'graduacao': 'linguagem acadêmica de nível universitário',
    'pos-graduacao': 'linguagem técnica e acadêmica avançada'
  };
  
  const styleInstructions = {
    'formal': 'estilo formal e acadêmico',
    'tecnico': 'estilo técnico e objetivo',
    'didatico': 'estilo didático e explicativo'
  };
  
  const currentTopic = topic || 'o tema especificado';
  
  const prompt = `
Você é um assistente especializado em criação de relatórios acadêmicos. Com base nas informações fornecidas, crie ${lengthInstructions[length]} sobre ${currentTopic}.

INSTRUÇÕES ESPECÍFICAS:
- Nível acadêmico: ${levelInstructions[academicLevel]}
- Estilo: ${styleInstructions[style]}
- Organize o conteúdo em seções claras
- Use linguagem apropriada para o nível especificado
- Inclua informações relevantes e bem estruturadas

ENTRADA DO USUÁRIO:
${userInput}

FORMATO DE RESPOSTA: Retorne um JSON com a seguinte estrutura exata:
{
"titulo": "Título do Relatório",
"introducao": "Texto da introdução...",
"desenvolvimento": "Texto do desenvolvimento com seções...",
"consideracoes": "Texto das considerações finais...",
"referencias": "Referências bibliográficas formatadas..."
}

IMPORTANTE: 
- Retorne APENAS o JSON válido, sem texto adicional
- Use quebras de linha \\n\\n para separar parágrafos
- Para destacar subtítulos no desenvolvimento, use **Título da Seção**
- As referências devem seguir formato ABNT básico
- Garanta que o JSON seja válido e parseable
`;

  const requestBody = {
    contents: [
      {
        parts: [
          {
            text: prompt
          }
        ]
      }
    ],
    generationConfig: {
      temperature: 0.7,
      topK: 40,
      topP: 0.95,
      maxOutputTokens: 4096,
    }
  };

  const response = await fetch(API_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-goog-api-key': GEMINI_API_KEY
    },
    body: JSON.stringify(requestBody)
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(`Erro da API Gemini: ${response.status} - ${errorData.error?.message || 'Erro desconhecido'}`);
  }

  const data = await response.json();
  
  if (!data.candidates || !data.candidates[0] || !data.candidates[0].content) {
    throw new Error('Resposta inválida da API Gemini');
  }

  const generatedText = data.candidates[0].content.parts[0].text;
  
  try {
    // Tentar extrair JSON da resposta
    const jsonMatch = generatedText.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      throw new Error('JSON não encontrado na resposta');
    }
    
    const parsedContent = JSON.parse(jsonMatch[0]);
    
    // Validar estrutura esperada
    if (!parsedContent.titulo || !parsedContent.introducao || !parsedContent.desenvolvimento) {
      throw new Error('Estrutura de resposta inválida');
    }
    
    return parsedContent;
    
  } catch (parseError) {
    console.error('Erro ao parsear JSON:', parseError);
    console.log('Resposta recebida:', generatedText);
    
    // Fallback: criar estrutura básica com o texto recebido
    return {
      titulo: topic || 'Relatório Gerado por IA',
      introducao: generatedText.substring(0, 500) + '...',
      desenvolvimento: generatedText,
      consideracoes: 'Considerações finais baseadas na análise apresentada.',
      referencias: 'Referências serão adicionadas conforme necessário.'
    };
  }
}

// Inserir conteúdo gerado no relatório
function insertGeneratedContent(content) {
  // Atualizar título
  const titleElement = document.querySelector('h1[contenteditable="true"]');
  if (titleElement && content.titulo) {
    titleElement.textContent = content.titulo;
    // Salvar título no localStorage
    localStorage.setItem('titulo_relatorio', content.titulo);
  }
  
  // Verificar qual versão está ativa
  const reportType = document.getElementById('reportType').value;
  
  if (reportType === 'detailed') {
    // Versão detalhada - inserir em cada seção específica
    const sections = {
      'introducao': content.introducao,
      'desenvolvimento': content.desenvolvimento,
      'consideracoes': content.consideracoes,
      'referencias': content.referencias
    };
    
    Object.keys(sections).forEach(sectionId => {
      const section = document.getElementById(sectionId);
      if (section && sections[sectionId]) {
        const editable = section.querySelector('.editable');
        if (editable) {
          // Converter texto para HTML com formatação
          let htmlContent = sections[sectionId]
            .replace(/\n\n/g, '</p><p>')
            .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
            .replace(/\n/g, '<br>');
          
          // Garantir que comece e termine com tags p
          if (!htmlContent.startsWith('<p>')) {
            htmlContent = '<p>' + htmlContent;
          }
          if (!htmlContent.endsWith('</p>')) {
            htmlContent = htmlContent + '</p>';
          }
          
          editable.innerHTML = htmlContent;
          
          // Limpar placeholder
          editable.classList.remove('empty');
        }
      }
    });
    
    // Atualizar contadores de palavras da versão detalhada
    setTimeout(() => {
      updateDetailedWordCounts();
    }, 100);
    
  } else {
    // Versão simples - inserir tudo no campo único
    const simpleContent = document.getElementById('simpleContent');
    if (simpleContent) {
      const fullContent = `
        <h3>Introdução</h3>
        <p>${content.introducao}</p>
        
        <h3>Desenvolvimento</h3>
        ${content.desenvolvimento.replace(/\n\n/g, '</p><p>').replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')}
        
        <h3>Considerações Finais</h3>
        <p>${content.consideracoes}</p>
        
        <h3>Referências Bibliográficas</h3>
        <p>${content.referencias.replace(/\n\n/g, '</p><p>')}</p>
      `;
      simpleContent.innerHTML = fullContent;
      
      // Limpar placeholder
      simpleContent.classList.remove('empty');
      
      // Atualizar contador de palavras da versão simples
      setTimeout(() => {
        updateWordCount();
      }, 100);
    }
  }
}

// Event listeners para fechar modal
window.addEventListener('click', function(event) {
  const modal = document.getElementById('modal-ia');
  if (event.target === modal) {
    closeIAModal();
  }
});

// Fechar modal com ESC
document.addEventListener('keydown', function(event) {
  if (event.key === 'Escape') {
    closeIAModal();
  }
});

// Mostrar transcrição na interface
function showTranscription(transcriptionText) {
  const transcriptionArea = document.getElementById('transcriptionArea');
  const transcriptionTextElement = document.getElementById('transcriptionText');
  
  if (transcriptionText && transcriptionText.trim()) {
    transcriptionTextElement.textContent = transcriptionText;
    transcriptionArea.style.display = 'block';
    
    // Adicionar indicador de que a transcrição está pronta
    const statusDiv = transcriptionArea.querySelector('.transcription-status');
    if (!statusDiv) {
      const status = document.createElement('div');
      status.className = 'transcription-status';
      status.style.cssText = 'margin-top: 8px; padding: 8px; background: #d4edda; border: 1px solid #c3e6cb; border-radius: 4px; font-size: 12px; color: #155724;';
      status.innerHTML = '<strong>✅ Transcrição pronta!</strong> Esta transcrição será usada na geração do relatório.';
      transcriptionArea.appendChild(status);
    }
    
    // Rolar para mostrar a transcrição
    transcriptionArea.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
  } else {
    transcriptionArea.style.display = 'none';
  }
}

// Limpar transcrição quando necessário
function clearTranscription() {
  const transcriptionArea = document.getElementById('transcriptionArea');
  const transcriptionTextElement = document.getElementById('transcriptionText');
  
  transcriptionTextElement.textContent = '';
  transcriptionArea.style.display = 'none';
}

// Função para mostrar tooltip temporariamente
function showTooltipTemporarily(tooltipId, message, type = 'default', duration = 2000) {
  const tooltip = document.getElementById(tooltipId);
  const container = tooltip?.parentElement;
  
  if (tooltip && container) {
    const originalMessage = tooltip.textContent;
    const originalClasses = container.className;
    
    updateTooltip(tooltipId, message, type);
    container.classList.add('active');
    
    setTimeout(() => {
      container.classList.remove('active');
      tooltip.textContent = originalMessage;
      container.className = originalClasses;
    }, duration);
  }
}

// Eventos para mobile (toque longo para mostrar tooltip)
function addMobileTooltipEvents() {
  const tooltipContainers = document.querySelectorAll('.tooltip');
  
  tooltipContainers.forEach(container => {
    let touchTimer;
    
    container.addEventListener('touchstart', function(e) {
      touchTimer = setTimeout(() => {
        container.classList.add('active');
      }, 500); // Mostrar tooltip após 500ms de toque
    });
    
    container.addEventListener('touchend', function(e) {
      clearTimeout(touchTimer);
      setTimeout(() => {
        container.classList.remove('active');
      }, 2000); // Esconder após 2 segundos
    });
    
    container.addEventListener('touchmove', function(e) {
      clearTimeout(touchTimer);
      container.classList.remove('active');
    });
  });
}

// Função para abrir o modal de IA
function generateReport() {
  const modal = document.getElementById('modal-ia');
  modal.style.display = 'block';
  
  // Aplicar classe para fade/slide in
  setTimeout(() => {
    modal.classList.add('modal-show');
  }, 10);
  
  // Inicializar visualizador de áudio
  initializeAudioVisualizer();
  
  // Verificar permissões de microfone
  checkMicrophonePermissions();
  
  // Carregar e exibir status da API Key
  loadApiKeyFromStorage();
  updateApiKeyStatus();
}

// Verificar permissões de microfone
async function checkMicrophonePermissions() {
  const recordBtn = document.getElementById('recordBtn');
  const audioNotice = document.querySelector('.audio-notice');
  
  try {
    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
      updateAudioStatus('unsupported', 'Gravação de áudio não suportada neste navegador');
      return;
    }

    // Verificar permissões
    if (navigator.permissions) {
      try {
        const permissionStatus = await navigator.permissions.query({ name: 'microphone' });
        
        switch (permissionStatus.state) {
          case 'granted':
            updateAudioStatus('ready', 'Microfone disponível - clique para gravar');
            break;
          case 'denied':
            updateAudioStatus('denied', 'Permissão de microfone negada - use a opção de texto');
            break;
          case 'prompt':
            updateAudioStatus('prompt', 'Clique para gravar - será solicitada permissão');
            break;
        }
        
        // Monitorar mudanças de permissão
        permissionStatus.onchange = () => {
          checkMicrophonePermissions();
        };
        
      } catch (permError) {
        console.warn('Não foi possível verificar permissões:', permError);
        updateAudioStatus('unknown', 'Clique para testar gravação de áudio');
      }
    } else {
      updateAudioStatus('unknown', 'Clique para testar gravação de áudio');
    }
    
  } catch (error) {
    console.error('Erro ao verificar microfone:', error);
    updateAudioStatus('error', 'Erro ao verificar microfone');
  }
}

// Atualizar status do áudio na UI
function updateAudioStatus(status, message) {
  const recordBtn = document.getElementById('recordBtn');
  const audioNotice = document.querySelector('.audio-notice');
  
  // Resetar classes
  recordBtn.classList.remove('btn-disabled', 'btn-warning');
  
  switch (status) {
    case 'ready':
      audioNotice.style.background = '#d4edda';
      audioNotice.style.borderColor = '#c3e6cb';
      audioNotice.style.color = '#155724';
      audioNotice.innerHTML = `<strong>✅ Pronto:</strong> ${message}`;
      recordBtn.disabled = false;
      break;
      
    case 'denied':
    case 'unsupported':
      audioNotice.style.background = '#f8d7da';
      audioNotice.style.borderColor = '#f5c6cb';
      audioNotice.style.color = '#721c24';
      audioNotice.innerHTML = `<strong>❌ Indisponível:</strong> ${message}`;
      recordBtn.disabled = true;
      recordBtn.classList.add('btn-disabled');
      break;
      
    case 'prompt':
      audioNotice.style.background = '#cce7ff';
      audioNotice.style.borderColor = '#b3d9ff';
      audioNotice.style.color = '#004085';
      audioNotice.innerHTML = `<strong>🔍 Permissão:</strong> ${message}`;
      recordBtn.disabled = false;
      break;
      
    default:
      audioNotice.style.background = '#fff3cd';
      audioNotice.style.borderColor = '#ffeaa7';
      audioNotice.style.color = '#856404';
      audioNotice.innerHTML = `<strong>💡 Dica:</strong> ${message}`;
      recordBtn.disabled = false;
  }
}

// Função para carregar API Key do localStorage
function loadApiKeyFromStorage() {
  const apiKey = getGeminiApiKey();
  const input = document.getElementById('geminiApiKey');
  if (input && apiKey) {
    input.value = apiKey;
  }
}

// ===== MODAL DE INFORMAÇÕES =====

// Função para mostrar modal de informações
function showInfoModal() {
  const modal = document.getElementById('infoModal');
  modal.style.display = 'block';
  
  // Adicionar animação de entrada
  setTimeout(() => {
    modal.classList.add('modal-show');
  }, 10);
}

// Função para fechar modal de informações
function closeInfoModal() {
  const modal = document.getElementById('infoModal');
  modal.classList.remove('modal-show');
  
  setTimeout(() => {
    modal.style.display = 'none';
  }, 300);
}

// Fechar modal clicando fora dele
window.addEventListener('click', function(event) {
  const infoModal = document.getElementById('infoModal');
  if (event.target === infoModal) {
    closeInfoModal();
  }
});

// Fechar modal com ESC
document.addEventListener('keydown', function(event) {
  if (event.key === 'Escape') {
    const infoModal = document.getElementById('infoModal');
    if (infoModal.style.display === 'block') {
      closeInfoModal();
    }
  }
});

// Função para criar um novo container de áudio
function createAudioRecordingContainer(recordingId) {
  const container = document.getElementById('audioRecordingsContainer');
  
  const audioItem = document.createElement('div');
  audioItem.className = 'audio-recording-item recording';
  audioItem.id = `audio_item_${recordingId}`;
  
  audioItem.innerHTML = `
    <div class="audio-item-header">
      <div class="audio-item-title">
        <span class="recording-indicator">
          <span class="pulse-dot"></span>
          Gravando...
        </span>
        <span class="audio-counter">${audioRecordings.length + 1}</span>
      </div>
      <div class="audio-item-actions">
        <button class="btn-delete-audio" onclick="deleteAudioRecording('${recordingId}')" title="Excluir gravação">
          ×
        </button>
      </div>
    </div>
    <div class="audio-item-controls">
      <audio id="audio_${recordingId}" controls style="display: none;"></audio>
      <button class="btn-transcribe-single" id="transcribe_${recordingId}" onclick="transcribeSingleAudio('${recordingId}')" disabled>
        <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2-2V7.5z"></path>
          <path d="M14 2v6h6"></path>
          <path d="M16 13H8"></path>
          <path d="M16 17H8"></path>
          <path d="M10 9H8"></path>
        </svg>
        Transcrever
      </button>
    </div>
    <div class="audio-transcription-area" id="transcription_area_${recordingId}">
      <div class="audio-transcription-text" id="transcription_text_${recordingId}"></div>
      <div class="audio-transcription-status transcription-status-processing" id="transcription_status_${recordingId}">
        Aguardando transcrição...
      </div>
    </div>
  `;
  
  container.appendChild(audioItem);
  
  // Scroll para o novo item
  audioItem.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
}

// Função para atualizar o container de áudio após a gravação
function updateAudioRecordingContainer(recordingId, audioBlob, audioUrl) {
  const audioItem = document.getElementById(`audio_item_${recordingId}`);
  if (!audioItem) return;
  
  // Remover classe de gravação
  audioItem.classList.remove('recording');
  
  // Atualizar cabeçalho
  const titleElement = audioItem.querySelector('.audio-item-title');
  titleElement.innerHTML = `
    <span>🎤 Gravação ${audioRecordings.length + 1}</span>
    <span class="audio-counter">${audioRecordings.length + 1}</span>
  `;
  
  // Configurar áudio
  const audioElement = audioItem.querySelector(`#audio_${recordingId}`);
  audioElement.src = audioUrl;
  audioElement.style.display = 'block';
  
  // Habilitar botão de transcrição
  const transcribeBtn = audioItem.querySelector(`#transcribe_${recordingId}`);
  transcribeBtn.disabled = false;
  
  // Mostrar área de transcrição
  const transcriptionArea = audioItem.querySelector(`#transcription_area_${recordingId}`);
  transcriptionArea.style.display = 'block';
  transcriptionArea.classList.add('show');
  
  // Atualizar status
  const statusElement = audioItem.querySelector(`#transcription_status_${recordingId}`);
  statusElement.textContent = 'Pronto para transcrição';
  statusElement.className = 'audio-transcription-status transcription-status-processing';
}

// Função para excluir uma gravação
function deleteAudioRecording(recordingId) {
  const audioItem = document.getElementById(`audio_item_${recordingId}`);
  if (!audioItem) return;
  
  // Remover da lista de gravações
  const index = audioRecordings.findIndex(recording => recording.id === recordingId);
  if (index > -1) {
    // Liberar URL do objeto
    URL.revokeObjectURL(audioRecordings[index].url);
    audioRecordings.splice(index, 1);
  }
  
  // Remover elemento do DOM
  audioItem.remove();
  
  // Atualizar contadores
  updateAudioCounters();
}

// Função para atualizar contadores de áudio
function updateAudioCounters() {
  const audioItems = document.querySelectorAll('.audio-recording-item');
  audioItems.forEach((item, index) => {
    const counter = item.querySelector('.audio-counter');
    if (counter) {
      counter.textContent = index + 1;
    }
    
    const title = item.querySelector('.audio-item-title span:first-child');
    if (title && !title.querySelector('.recording-indicator')) {
      title.textContent = `🎤 Gravação ${index + 1}`;
    }
  });
}

// Função para transcrever um áudio específico
async function transcribeSingleAudio(recordingId) {
  const recording = audioRecordings.find(r => r.id === recordingId);
  if (!recording) {
    customAlert('Gravação não encontrada.', 'error');
    return;
  }
  
  const audioItem = document.getElementById(`audio_item_${recordingId}`);
  const transcribeBtn = audioItem.querySelector(`#transcribe_${recordingId}`);
  const transcriptionText = audioItem.querySelector(`#transcription_text_${recordingId}`);
  const statusElement = audioItem.querySelector(`#transcription_status_${recordingId}`);
  
  try {
    // Atualizar UI do botão
    transcribeBtn.disabled = true;
    transcribeBtn.classList.add('transcribing');
    transcribeBtn.innerHTML = `
      <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide-loader-2">
        <path d="M21 12a9 9 0 11-6.219-8.56"></path>
      </svg>
      Transcrevendo...
    `;
    
    // Atualizar status
    statusElement.textContent = 'Processando transcrição...';
    statusElement.className = 'audio-transcription-status transcription-status-processing';
    
    // Converter áudio para base64
    const base64Audio = await convertAudioToBase64(recording.blob);
    
    // Transcrever usando Gemini
    const transcription = await transcribeAudioWithGemini(base64Audio, recording.blob.type);
    
    // Atualizar gravação
    recording.transcribed = true;
    recording.transcription = transcription;
    
    // Atualizar UI
    transcriptionText.textContent = transcription;
    statusElement.textContent = 'Transcrição concluída';
    statusElement.className = 'audio-transcription-status transcription-status-success';
    
    // Atualizar classe do container
    audioItem.classList.add('transcribed');
    
    // Restaurar botão
    transcribeBtn.disabled = false;
    transcribeBtn.classList.remove('transcribing');
    transcribeBtn.innerHTML = `
      <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
        <path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2-2V7.5z"></path>
        <path d="M14 2v6h6"></path>
        <path d="M16 13H8"></path>
        <path d="M16 17H8"></path>
        <path d="M10 9H8"></path>
      </svg>
      Transcrito
    `;
    
    console.log(`Transcrição concluída para ${recordingId}:`, transcription.substring(0, 100) + '...');
    
  } catch (error) {
    console.error('Erro ao transcrever áudio:', error);
    
    // Atualizar status de erro
    statusElement.textContent = 'Erro na transcrição: ' + error.message;
    statusElement.className = 'audio-transcription-status transcription-status-error';
    
    // Atualizar classe do container
    audioItem.classList.add('error');
    
    // Restaurar botão
    transcribeBtn.disabled = false;
    transcribeBtn.classList.remove('transcribing');
    transcribeBtn.innerHTML = `
      <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
        <path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2-2V7.5z"></path>
        <path d="M14 2v6h6"></path>
        <path d="M16 13H8"></path>
        <path d="M16 17H8"></path>
        <path d="M10 9H8"></path>
      </svg>
      Tentar Novamente
    `;
    
    customAlert('Erro ao transcrever áudio: ' + error.message + '\n\nTente novamente ou use apenas a descrição em texto.', 'error');
  }
}

// ===== SISTEMA DE ALERTA PERSONALIZADO =====

// Função para mostrar alerta personalizado
function showCustomAlert(message, type = 'info', title = null, buttons = null) {
  const modal = document.getElementById('customAlertModal');
  const alertTitle = document.getElementById('alertTitleText');
  const alertMessage = document.getElementById('alertMessage');
  const alertButtons = document.getElementById('alertButtons');
  const alertIcon = document.getElementById('alertIcon');
  
  // Definir título padrão baseado no tipo
  if (!title) {
    switch (type) {
      case 'success':
        title = 'Sucesso';
        break;
      case 'warning':
        title = 'Atenção';
        break;
      case 'error':
        title = 'Erro';
        break;
      default:
        title = 'Informação';
    }
  }
  
  // Configurar ícone baseado no tipo
  switch (type) {
    case 'success':
      alertIcon.innerHTML = `
        <circle cx="12" cy="12" r="10"></circle>
        <polyline points="20 6 9 17 4 12"></polyline>
      `;
      break;
    case 'warning':
      alertIcon.innerHTML = `
        <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"></path>
        <line x1="12" y1="9" x2="12" y2="13"></line>
        <line x1="12" y1="17" x2="12.01" y2="17"></line>
      `;
      break;
    case 'error':
      alertIcon.innerHTML = `
        <circle cx="12" cy="12" r="10"></circle>
        <line x1="15" y1="9" x2="9" y2="15"></line>
        <line x1="9" y1="9" x2="15" y2="15"></line>
      `;
      break;
    default:
      alertIcon.innerHTML = `
        <circle cx="12" cy="12" r="10"></circle>
        <line x1="12" y1="16" x2="12" y2="12"></line>
        <line x1="12" y1="8" x2="12.01" y2="8"></line>
      `;
  }
  
  // Configurar conteúdo
  alertTitle.textContent = title;
  alertMessage.textContent = message;
  
  // Configurar botões
  if (!buttons) {
    buttons = [{ text: 'OK', type: 'primary', action: 'close' }];
  }
  
  alertButtons.innerHTML = '';
  buttons.forEach(button => {
    const btn = document.createElement('button');
    btn.className = `alert-btn alert-btn-${button.type || 'primary'}`;
    btn.textContent = button.text;
    btn.onclick = () => {
      if (button.action === 'close') {
        closeCustomAlert();
      } else if (typeof button.action === 'function') {
        button.action();
        closeCustomAlert();
      }
    };
    alertButtons.appendChild(btn);
  });
  
  // Configurar classe do modal baseada no tipo
  modal.className = `modal alert-${type}`;
  
  // Mostrar modal
  modal.style.display = 'block';
  setTimeout(() => {
    modal.classList.add('modal-show');
  }, 10);
  
  // Retornar Promise para compatibilidade com confirm()
  return new Promise((resolve) => {
    window.customAlertResolve = resolve;
  });
}

// Função para fechar alerta personalizado
function closeCustomAlert() {
  const modal = document.getElementById('customAlertModal');
  modal.classList.remove('modal-show');
  
  setTimeout(() => {
    modal.style.display = 'none';
    // Resolver Promise se existir
    if (window.customAlertResolve) {
      window.customAlertResolve(true);
      window.customAlertResolve = null;
    }
  }, 300);
}

// Função para mostrar alerta simples (substitui alert())
function customAlert(message, type = 'info') {
  return showCustomAlert(message, type);
}

// Função para mostrar confirmação (substitui confirm())
function customConfirm(message, title = 'Confirmar') {
  return showCustomAlert(message, 'warning', title, [
    { text: 'Cancelar', type: 'secondary', action: () => window.customAlertResolve(false) },
    { text: 'Confirmar', type: 'primary', action: () => window.customAlertResolve(true) }
  ]);
}

// Função para mostrar prompt (substitui prompt())
function customPrompt(message, defaultValue = '', title = 'Entrada') {
  const modal = document.getElementById('customAlertModal');
  const alertMessage = document.getElementById('alertMessage');
  const alertButtons = document.getElementById('alertButtons');
  
  // Criar input
  const input = document.createElement('input');
  input.type = 'text';
  input.value = defaultValue;
  input.className = 'form-control';
  input.style.cssText = `
    width: 100%;
    padding: 8px 12px;
    border: 1px solid #ddd;
    border-radius: 4px;
    font-size: 14px;
    margin-top: 10px;
  `;
  
  // Configurar mensagem com input
  alertMessage.innerHTML = message;
  alertMessage.appendChild(input);
  
  // Configurar botões
  alertButtons.innerHTML = `
    <button class="alert-btn alert-btn-secondary" onclick="closeCustomAlert()">Cancelar</button>
    <button class="alert-btn alert-btn-primary" onclick="handlePromptConfirm()">OK</button>
  `;
  
  // Mostrar modal
  modal.style.display = 'block';
  setTimeout(() => {
    modal.classList.add('modal-show');
    input.focus();
  }, 10);
  
  // Retornar Promise
  return new Promise((resolve) => {
    window.customPromptResolve = resolve;
    window.customPromptInput = input;
  });
}

// Função para lidar com confirmação do prompt
function handlePromptConfirm() {
  const input = window.customPromptInput;
  const value = input ? input.value : '';
  closeCustomAlert();
  
  if (window.customPromptResolve) {
    window.customPromptResolve(value);
    window.customPromptResolve = null;
    window.customPromptInput = null;
  }
}

// Event listeners para o modal de alerta
window.addEventListener('click', function(event) {
  const modal = document.getElementById('customAlertModal');
  if (event.target === modal) {
    closeCustomAlert();
  }
});

document.addEventListener('keydown', function(event) {
  if (event.key === 'Escape') {
    const modal = document.getElementById('customAlertModal');
    if (modal.style.display === 'block') {
      closeCustomAlert();
    }
  }
});