document.addEventListener('DOMContentLoaded', function() {
    const namesInput = document.getElementById('namesInput');
    const generateBtn = document.getElementById('generateBtn');
    const downloadAllBtn = document.getElementById('downloadAllBtn');
    const clearBtn = document.getElementById('clearBtn');
    const certificatePreview = document.getElementById('certificatePreview');
    const certificateList = document.getElementById('certificateList');
    
    let certificates = [];
    
    // Função para processar os nomes inseridos
    function processNames() {
        const input = namesInput.value.trim();
        if (!input) {
            alert('Por favor, insira pelo menos um nome.');
            return;
        }
        
        // Dividir nomes por várias formas de separação
        const names = input.split(/[\n,;:]+/)
            .map(name => name.trim())
            .filter(name => name !== '');
        
        if (names.length === 0) {
            alert('Nenhum nome válido foi encontrado.');
            return;
        }
        
        certificates = names;
        updateCertificateList();
        updatePreview(names[0]);
        
        alert(`${names.length} certificado(s) gerado(s) com sucesso!`);
    }
    
    // Atualizar a lista de certificados
    function updateCertificateList() {
        certificateList.innerHTML = '';
        
        if (certificates.length === 0) {
            certificateList.innerHTML = '<p>Nenhum certificado gerado ainda.</p>';
            return;
        }
        
        certificates.forEach((name, index) => {
            const item = document.createElement('div');
            item.className = 'certificate-item';
            
            item.innerHTML = `
                <span>${name}</span>
                <div class="certificate-actions">
                    <button class="btn btn-small preview-cert" data-index="${index}">Visualizar</button>
                    <button class="btn btn-small btn-gold download-cert" data-index="${index}">Baixar PDF</button>
                </div>
            `;
            
            certificateList.appendChild(item);
        });
        
        // Adicionar eventos aos botões
        document.querySelectorAll('.preview-cert').forEach(btn => {
            btn.addEventListener('click', function() {
                const index = parseInt(this.getAttribute('data-index'));
                updatePreview(certificates[index]);
            });
        });
        
        document.querySelectorAll('.download-cert').forEach(btn => {
            btn.addEventListener('click', function() {
                const index = parseInt(this.getAttribute('data-index'));
                downloadCertificate(certificates[index], index);
            });
        });
    }
    
    // Atualizar a pré-visualização
    function updatePreview(name) {
        const preview = createCertificateElement(name, true);
        certificatePreview.innerHTML = '';
        certificatePreview.appendChild(preview);
    }
    
    // Baixar um certificado individual
    async function downloadCertificate(name, index) {
        try {
            // Criar elemento otimizado para PDF
            const certificateElement = createCertificateElement(name, false);
            
            // Adicionar ao documento temporariamente
            const tempContainer = document.createElement('div');
            tempContainer.style.position = 'fixed';
            tempContainer.style.left = '-9999px';
            tempContainer.style.top = '0';
            tempContainer.appendChild(certificateElement);
            document.body.appendChild(tempContainer);
            
            // Aguardar para garantir renderização
            await new Promise(resolve => setTimeout(resolve, 500));
            
            // Configurações do PDF otimizadas para A4 landscape
            const opt = {
                margin: [0, 0, 0, 0], // Margens zeradas
                filename: `certificado_${name.replace(/\s+/g, '_')}.pdf`,
                image: { 
                    type: 'jpeg', 
                    quality: 0.98 
                },
                html2canvas: { 
                    scale: 2,
                    useCORS: true,
                    logging: false,
                    width: 1123, // Largura em pixels para A4 landscape (297mm)
                    height: 794,  // Altura em pixels para A4 landscape (210mm)
                    scrollX: 0,
                    scrollY: 0,
                    windowWidth: 1123,
                    windowHeight: 794,
                    backgroundColor: '#FFFFFF'
                },
                jsPDF: { 
                    unit: 'mm', 
                    format: 'a4', 
                    orientation: 'landscape'
                }
            };
            
            // Gerar PDF
            await html2pdf().set(opt).from(certificateElement).save();
            
            // Limpar elemento temporário
            document.body.removeChild(tempContainer);
            
        } catch (error) {
            console.error('Erro ao gerar PDF:', error);
            alert('Erro ao gerar PDF. Tente novamente.');
        }
    }
    
    // Criar elemento de certificado
    function createCertificateElement(name, isPreview = false) {
        const certificateElement = document.createElement('div');
        certificateElement.className = isPreview ? 'certificate-preview-mode' : 'certificate-print-mode';
        
        certificateElement.innerHTML = `
            <div class="corner-decoration top-left"></div>
            <div class="corner-decoration bottom-right"></div>
            
            <h1 class="certificate-title">CERTIFICADO</h1>
            <p class="certificate-subtitle">ESTE CERTIFICADO COMPROVA QUE</p>
            
            <h2 class="participant-name">${name}</h2>
            
            <div class="certificate-body">
                <p>CONCLUIU COM ÊXITO O CURSO GASTRONOMIA MINISTRADO POR BORCELLE</p>
                <p>ENTRE 28/08/2019 E 28/08/2022 E DEMONSTROU DEDICAÇÃO E EMPENHO EXEMPLARES.</p>
                <p>PARABÉNS E BOA SORTE NO FUTURO. EMITIDO EM 13/09/2022 PELA BORCELLE.</p>
            </div>
            
            <div class="signature">
                <div class="signature-name">Ariel Lima</div>
                <div class="signature-role">Diretora Responsável</div>
            </div>
        `;
        
        return certificateElement;
    }
    
    // Baixar todos os certificados
    async function downloadAllCertificates() {
        if (certificates.length === 0) {
            alert('Nenhum certificado para baixar. Gere os certificados primeiro.');
            return;
        }
        
        if (certificates.length > 5) {
            if (!confirm(`Você está prestes a baixar ${certificates.length} certificados. Isso pode levar alguns minutos. Deseja continuar?`)) {
                return;
            }
        }
        
        const downloadBtn = downloadAllBtn;
        const originalText = downloadBtn.textContent;
        downloadBtn.textContent = 'Baixando...';
        downloadBtn.disabled = true;
        
        try {
            // Baixar certificados sequencialmente
            for (let i = 0; i < certificates.length; i++) {
                await downloadCertificate(certificates[i], i);
                
                // Aguardar entre os downloads
                if (i < certificates.length - 1) {
                    await new Promise(resolve => setTimeout(resolve, 1000));
                }
            }
            
            alert('Todos os certificados foram baixados com sucesso!');
        } catch (error) {
            console.error('Erro no download em massa:', error);
            alert('Ocorreu um erro durante o download. Alguns certificados podem não ter sido baixados.');
        } finally {
            downloadBtn.textContent = originalText;
            downloadBtn.disabled = false;
        }
    }
    
    // Limpar a lista
    function clearList() {
        if (confirm('Tem certeza que deseja limpar a lista de certificados?')) {
            certificates = [];
            namesInput.value = '';
            certificateList.innerHTML = '<p>Nenhum certificado gerado ainda.</p>';
            certificatePreview.innerHTML = '<p>Selecione um certificado para visualizar.</p>';
        }
    }
    
    // Event listeners
    generateBtn.addEventListener('click', processNames);
    downloadAllBtn.addEventListener('click', downloadAllCertificates);
    clearBtn.addEventListener('click', clearList);
    
    // Inicializar com um exemplo
    namesInput.value = "João Silva\nMaria Santos\nPedro Oliveira";
    updatePreview("João Silva");
    updateCertificateList();
});