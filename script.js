document.addEventListener('DOMContentLoaded', function() {
    const namesInput = document.getElementById('namesInput');
    const generateBtn = document.getElementById('generateBtn');
    const downloadAllBtn = document.getElementById('downloadAllBtn');
    const clearBtn = document.getElementById('clearBtn');
    const certificatePreview = document.getElementById('certificatePreview');
    const certificateList = document.getElementById('certificateList');
    const certificateTemplate = document.getElementById('certificateTemplate');
    
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
        const preview = createCertificateElement(name);
        certificatePreview.innerHTML = '';
        certificatePreview.appendChild(preview);
    }
    
    // Baixar um certificado individual
    function downloadCertificate(name, index) {
        const certificateElement = createCertificateElement(name);
        
        // Configurações do PDF
        const opt = {
            margin: 0,
            filename: `certificado_${name.replace(/\s+/g, '_')}.pdf`,
            image: { type: 'jpeg', quality: 1 },
            html2canvas: { 
                scale: 2,
                useCORS: true,
                logging: false,
                width: certificateElement.scrollWidth,
                height: certificateElement.scrollHeight
            },
            jsPDF: { 
                unit: 'mm', 
                format: 'a4', 
                orientation: 'landscape' 
            }
        };
        
        // Gerar PDF
        html2pdf().set(opt).from(certificateElement).save();
    }
    
    // Baixar todos os certificados
    function downloadAllCertificates() {
        if (certificates.length === 0) {
            alert('Nenhum certificado para baixar. Gere os certificados primeiro.');
            return;
        }
        
        if (certificates.length > 10) {
            if (!confirm(`Você está prestes a baixar ${certificates.length} certificados. Isso pode levar alguns instantes. Deseja continuar?`)) {
                return;
            }
        }
        
        alert(`Iniciando download de ${certificates.length} certificados...`);
        
        // Baixar certificados com intervalo para evitar sobrecarga
        certificates.forEach((name, index) => {
            setTimeout(() => {
                downloadCertificate(name, index);
            }, index * 1500); // Espaçar os downloads por 1.5 segundos
        });
    }
    
    // Criar elemento de certificado
    function createCertificateElement(name) {
        const certificateElement = certificateTemplate.cloneNode(true);
        certificateElement.id = '';
        certificateElement.classList.remove('hidden');
        certificateElement.querySelector('#certName').textContent = name;
        
        return certificateElement;
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