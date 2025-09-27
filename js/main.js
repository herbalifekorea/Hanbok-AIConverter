// 한복 AI 변환 프로그램 메인 JavaScript

class HanbokConverter {
    constructor() {
        this.selectedStyle = 'pink'; // 기본 스타일
        this.uploadedImage = null;
        this.basePrompt = "Keep the original person's face, skin, and expression exactly as in the photo. Do not generate or alter a new face. Strictly preserve the original identity. Change only the clothing into a modern and elegant Korean hanbok, with pastel pink or fresh youthful colors. For the woman, hairstyle should be neatly tied in an elegant updo. Photorealistic portrait, seamless blending, natural lighting, premium quality.";
        
        // 스타일별 프롬프트 정의
        this.stylePrompts = {
            pink: {
                name: "핑크톤 (산뜻하고 젊은 감각)",
                prompt: "Change only the clothing into a modern and elegant Korean hanbok with pastel pink skirt, white jeogori (upper garment), subtle gold embroidery details. Fresh and bright atmosphere, youthful and vibrant style."
            },
            navy: {
                name: "네이비 & 골드 (격식 있고 품위 있는 스타일)",
                prompt: "Change only the clothing into a modern and elegant Korean hanbok. For men: navy blue dopo (outer robe) with gold silk patterns. For women: deep purple or navy blue skirt with gold embroidery. Majestic and luxurious atmosphere, formal and dignified style."
            },
            lavender: {
                name: "화이트 & 라벤더 (우아하고 세련된 스타일)",
                prompt: "Change only the clothing into a modern and elegant Korean hanbok. For women: light purple skirt with white embroidered jeogori. For men: light gray hanbok. Subtle and elegant photoshoot atmosphere, sophisticated and refined style."
            }
        };
        
        this.initializeEventListeners();
        this.loadApiKey();
        this.updateConvertButton();
        this.updateApiStatus();
    }

    initializeEventListeners() {
        // 파일 업로드 관련 이벤트
        const dropZone = document.getElementById('dropZone');
        const imageInput = document.getElementById('imageInput');
        
        dropZone.addEventListener('click', () => imageInput.click());
        dropZone.addEventListener('dragover', this.handleDragOver.bind(this));
        dropZone.addEventListener('dragleave', this.handleDragLeave.bind(this));
        dropZone.addEventListener('drop', this.handleDrop.bind(this));
        imageInput.addEventListener('change', this.handleFileSelect.bind(this));
        
        // 스타일 선택 이벤트
        const styleCards = document.querySelectorAll('.style-card');
        styleCards.forEach(card => {
            card.addEventListener('click', () => {
                this.selectStyle(card.dataset.style);
                this.updateStyleSelection(card);
            });
        });
        
        // 기본 스타일 선택
        const defaultCard = document.querySelector('.style-card[data-style="pink"]');
        this.updateStyleSelection(defaultCard);
        
        // 변환 버튼 이벤트
        const convertBtn = document.getElementById('convertBtn');
        convertBtn.addEventListener('click', this.convertImage.bind(this));
        
        // 다운로드 버튼 이벤트
        const downloadBtn = document.getElementById('downloadBtn');
        downloadBtn.addEventListener('click', this.downloadResult.bind(this));
        
        // 설정 버튼 이벤트
        const settingsBtn = document.getElementById('settingsBtn');
        settingsBtn.addEventListener('click', this.showApiKeyModal.bind(this));
        
        // API 키 모달 이벤트
        const cancelApiKey = document.getElementById('cancelApiKey');
        const saveApiKey = document.getElementById('saveApiKey');
        
        cancelApiKey.addEventListener('click', this.hideApiKeyModal.bind(this));
        saveApiKey.addEventListener('click', this.saveApiKey.bind(this));
        
        // API 상태 클릭 이벤트
        const apiStatus = document.getElementById('apiStatus');
        apiStatus.addEventListener('click', this.showApiKeyModal.bind(this));
    }

    handleDragOver(e) {
        e.preventDefault();
        e.stopPropagation();
        e.dataTransfer.dropEffect = 'copy';
        
        const dropZone = document.getElementById('dropZone');
        dropZone.classList.add('drag-over');
    }

    handleDragLeave(e) {
        e.preventDefault();
        e.stopPropagation();
        
        const dropZone = document.getElementById('dropZone');
        dropZone.classList.remove('drag-over');
    }

    handleDrop(e) {
        e.preventDefault();
        e.stopPropagation();
        
        const dropZone = document.getElementById('dropZone');
        dropZone.classList.remove('drag-over');
        
        const files = e.dataTransfer.files;
        if (files.length > 0) {
            this.processFile(files[0]);
        }
    }

    handleFileSelect(e) {
        const file = e.target.files[0];
        if (file) {
            this.processFile(file);
        }
    }

    processFile(file) {
        // 파일 타입 검증
        if (!file.type.startsWith('image/')) {
            alert('이미지 파일만 업로드할 수 있습니다.');
            return;
        }
        
        // 파일 크기 검증 (20MB 제한)
        if (file.size > 20 * 1024 * 1024) {
            alert('파일 크기가 너무 큽니다. 20MB 이하의 파일을 선택해주세요.');
            return;
        }
        
        this.uploadedImage = file;
        this.displayPreview(file);
        this.showFileInfo(file);
        this.updateConvertButton();
    }

    displayPreview(file) {
        const reader = new FileReader();
        reader.onload = (e) => {
            const previewImage = document.getElementById('previewImage');
            const uploadPlaceholder = document.getElementById('uploadPlaceholder');
            
            previewImage.src = e.target.result;
            previewImage.classList.remove('hidden');
            uploadPlaceholder.classList.add('hidden');
        };
        reader.readAsDataURL(file);
    }

    showFileInfo(file) {
        const imageInfo = document.getElementById('imageInfo');
        const fileName = document.getElementById('fileName');
        const fileSize = document.getElementById('fileSize');
        
        fileName.textContent = file.name;
        fileSize.textContent = this.formatFileSize(file.size);
        imageInfo.classList.remove('hidden');
    }

    formatFileSize(bytes) {
        if (bytes === 0) return '0 Bytes';
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    }

    selectStyle(style) {
        this.selectedStyle = style;
        this.updateConvertButton();
    }

    updateStyleSelection(selectedCard) {
        // 모든 카드에서 선택 상태 제거
        const styleCards = document.querySelectorAll('.style-card');
        styleCards.forEach(card => {
            card.classList.remove('selected');
        });
        
        // 선택된 카드에 선택 상태 추가
        selectedCard.classList.add('selected');
    }

    updateConvertButton() {
        const convertBtn = document.getElementById('convertBtn');
        const hasApiKey = window.imageAPI.apiKey;
        const canConvert = this.uploadedImage && this.selectedStyle && hasApiKey;
        
        convertBtn.disabled = !canConvert;
        
        if (!hasApiKey) {
            convertBtn.innerHTML = '<i class="fas fa-key mr-3"></i>먼저 API 키를 설정해주세요';
        } else if (!this.uploadedImage) {
            convertBtn.innerHTML = '<i class="fas fa-image mr-3"></i>이미지를 업로드해주세요';
        } else if (!this.selectedStyle) {
            convertBtn.innerHTML = '<i class="fas fa-palette mr-3"></i>스타일을 선택해주세요';
        } else {
            convertBtn.innerHTML = '<i class="fas fa-magic mr-3"></i>한복으로 변환하기';
        }
    }

    async convertImage() {
        if (!this.uploadedImage || !this.selectedStyle) {
            alert('이미지와 스타일을 모두 선택해주세요.');
            return;
        }

        try {
            this.showLoading();
            
            // 이미지를 base64로 변환
            const imageUrl = await this.fileToBase64(this.uploadedImage);
            
            // 선택된 스타일에 맞는 프롬프트 생성
            const fullPrompt = this.generatePrompt();
            
            console.log('Generated prompt:', fullPrompt);
            console.log('Selected style:', this.selectedStyle);
            
            // API 호출 (실제 API 키 없이는 시뮬레이션)
            const result = await this.callGenerationAPI(imageUrl, fullPrompt);
            
            if (result.success) {
                this.showResult(result.imageUrl);
            } else {
                throw new Error(result.error || '이미지 생성에 실패했습니다.');
            }
            
        } catch (error) {
            console.error('변환 오류:', error);
            this.showError(error.message);
        }
    }

    generatePrompt() {
        const basePrompt = "Keep the original person's face, skin, and expression exactly as in the photo. Do not generate or alter a new face. Strictly preserve the original identity.";
        const stylePrompt = this.stylePrompts[this.selectedStyle].prompt;
        const endPrompt = "Photorealistic portrait, seamless blending, natural lighting, premium quality.";
        
        return `${basePrompt} ${stylePrompt} ${endPrompt}`;
    }

    fileToBase64(file) {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = () => resolve(reader.result);
            reader.onerror = reject;
            reader.readAsDataURL(file);
        });
    }

    async callGenerationAPI(imageUrl, prompt) {
        try {
            // 진행 바 애니메이션
            this.animateProgressBar();
            
            // API 키 확인
            if (!window.imageAPI.apiKey) {
                throw new Error('API 키가 설정되지 않았습니다. 설정 버튼을 클릭해서 API 키를 입력해주세요.');
            }
            
            // 실제 API 호출
            const result = await window.imageAPI.generateImage(imageUrl, prompt, '1:1');
            
            return result;
            
        } catch (error) {
            return {
                success: false,
                error: error.message
            };
        }
    }

    showLoading() {
        const resultPlaceholder = document.getElementById('resultPlaceholder');
        const loadingState = document.getElementById('loadingState');
        const resultImageContainer = document.getElementById('resultImageContainer');
        
        resultPlaceholder.classList.add('hidden');
        resultImageContainer.classList.add('hidden');
        loadingState.classList.remove('hidden');
        
        // 변환 버튼 비활성화
        const convertBtn = document.getElementById('convertBtn');
        convertBtn.disabled = true;
        convertBtn.innerHTML = '<i class="fas fa-spinner loading-spinner mr-3"></i>변환 중...';
    }

    animateProgressBar() {
        const progressBar = document.getElementById('progressBar');
        let progress = 0;
        
        const interval = setInterval(() => {
            progress += Math.random() * 15;
            if (progress > 90) progress = 90;
            progressBar.style.width = progress + '%';
        }, 300);
        
        // 3초 후 완료
        setTimeout(() => {
            clearInterval(interval);
            progressBar.style.width = '100%';
        }, 2800);
    }

    showResult(imageUrl) {
        const loadingState = document.getElementById('loadingState');
        const resultImageContainer = document.getElementById('resultImageContainer');
        const resultImage = document.getElementById('resultImage');
        
        resultImage.src = imageUrl;
        loadingState.classList.add('hidden');
        resultImageContainer.classList.remove('hidden');
        
        // 변환 버튼 다시 활성화
        this.updateConvertButton();
        
        // 결과 이미지 저장
        this.resultImageUrl = imageUrl;
    }

    showError(message) {
        const loadingState = document.getElementById('loadingState');
        const resultPlaceholder = document.getElementById('resultPlaceholder');
        
        loadingState.classList.add('hidden');
        resultPlaceholder.classList.remove('hidden');
        resultPlaceholder.innerHTML = `
            <i class="fas fa-exclamation-circle text-6xl text-red-400 mb-4"></i>
            <p class="text-lg text-red-600 mb-2">변환에 실패했습니다</p>
            <p class="text-sm text-gray-500">${message}</p>
        `;
        
        // 변환 버튼 다시 활성화
        this.updateConvertButton();
        
        // 에러 알림
        alert(`변환 실패: ${message}`);
    }

    downloadResult() {
        if (!this.resultImageUrl) {
            alert('다운로드할 이미지가 없습니다.');
            return;
        }
        
        // 이미지 다운로드
        const link = document.createElement('a');
        link.href = this.resultImageUrl;
        link.download = `hanbok_converted_${Date.now()}.png`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    }

    // API 키 관리 메서드들
    showApiKeyModal() {
        const modal = document.getElementById('apiKeyModal');
        const input = document.getElementById('apiKeyInput');
        
        // 기존 API 키가 있으면 표시
        if (window.imageAPI.apiKey) {
            input.value = window.imageAPI.apiKey;
        }
        
        modal.classList.remove('hidden');
        input.focus();
    }

    hideApiKeyModal() {
        const modal = document.getElementById('apiKeyModal');
        modal.classList.add('hidden');
    }

    async saveApiKey() {
        const input = document.getElementById('apiKeyInput');
        const apiKey = input.value.trim();
        
        if (!apiKey) {
            alert('API 키를 입력해주세요.');
            return;
        }
        
        if (!apiKey.startsWith('fal_')) {
            alert('올바른 FAL AI API 키 형식이 아닙니다. (fal_로 시작해야 함)');
            return;
        }
        
        // API 키 저장
        localStorage.setItem('fal_api_key', apiKey);
        window.imageAPI.setApiKey(apiKey);
        
        this.hideApiKeyModal();
        this.updateApiStatus();
        this.updateConvertButton();
        
        // 성공 메시지
        this.showNotification('API 키가 성공적으로 저장되었습니다!', 'success');
    }

    loadApiKey() {
        const savedApiKey = localStorage.getItem('fal_api_key');
        if (savedApiKey) {
            window.imageAPI.setApiKey(savedApiKey);
        }
    }

    updateApiStatus() {
        const apiStatus = document.getElementById('apiStatus');
        const hasApiKey = window.imageAPI.apiKey;
        
        if (hasApiKey) {
            apiStatus.innerHTML = `
                <div class="bg-green-100 text-green-700 px-4 py-2 rounded-lg shadow-lg flex items-center cursor-pointer hover:bg-green-200 transition-colors">
                    <i class="fas fa-check-circle mr-2"></i>
                    <span>API 키 설정됨</span>
                </div>
            `;
        } else {
            apiStatus.innerHTML = `
                <div class="bg-red-100 text-red-700 px-4 py-2 rounded-lg shadow-lg flex items-center cursor-pointer hover:bg-red-200 transition-colors">
                    <i class="fas fa-exclamation-triangle mr-2"></i>
                    <span>API 키가 설정되지 않음</span>
                </div>
            `;
        }
    }

    showNotification(message, type = 'info') {
        const notification = document.createElement('div');
        const bgColor = type === 'success' ? 'bg-green-500' : type === 'error' ? 'bg-red-500' : 'bg-blue-500';
        
        notification.className = `fixed top-20 right-4 ${bgColor} text-white px-6 py-3 rounded-lg shadow-lg z-50 transform translate-x-0 transition-transform duration-300`;
        notification.innerHTML = `
            <div class="flex items-center">
                <i class="fas ${type === 'success' ? 'fa-check' : type === 'error' ? 'fa-times' : 'fa-info'} mr-2"></i>
                <span>${message}</span>
            </div>
        `;
        
        document.body.appendChild(notification);
        
        setTimeout(() => {
            notification.style.transform = 'translateX(100%)';
            setTimeout(() => {
                document.body.removeChild(notification);
            }, 300);
        }, 3000);
    }
}

// 페이지 로드 시 초기화
document.addEventListener('DOMContentLoaded', () => {
    new HanbokConverter();
});