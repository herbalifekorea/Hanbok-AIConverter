// 제미나이 나노바나나 API 연동 모듈

class ImageGenerationAPI {
    constructor() {
        this.apiKey = null;
        this.apiEndpoint = 'https://fal.run/fal-ai/nano-banana';
    }

    setApiKey(apiKey) {
        this.apiKey = apiKey;
    }

    async generateImage(imageUrl, prompt, aspectRatio = '1:1') {
        if (!this.apiKey) {
            throw new Error('API 키가 설정되지 않았습니다. 설정에서 API 키를 입력해주세요.');
        }

        try {
            const response = await fetch(this.apiEndpoint, {
                method: 'POST',
                headers: {
                    'Authorization': `Key ${this.apiKey}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    image_urls: [imageUrl],
                    prompt: prompt,
                    aspect_ratio: aspectRatio,
                    num_images: 1,
                    guidance_scale: 7.5,
                    strength: 0.8,
                    steps: 30,
                    seed: Math.floor(Math.random() * 1000000)
                })
            });

            if (!response.ok) {
                const errorData = await response.text();
                throw new Error(`API 호출 실패: ${response.status} - ${errorData}`);
            }

            const result = await response.json();
            
            if (!result.images || result.images.length === 0) {
                throw new Error('생성된 이미지가 없습니다.');
            }

            return {
                success: true,
                imageUrl: result.images[0].url,
                seed: result.seed
            };

        } catch (error) {
            console.error('API 호출 오류:', error);
            return {
                success: false,
                error: error.message
            };
        }
    }

    // API 키 유효성 검증
    async validateApiKey(apiKey) {
        try {
            const testResponse = await fetch('https://fal.run/fal-ai/nano-banana', {
                method: 'POST',
                headers: {
                    'Authorization': `Key ${apiKey}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    image_urls: ['data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8/5+hHgAHggJ/PchI7wAAAABJRU5ErkJggg=='],
                    prompt: 'test',
                    aspect_ratio: '1:1',
                    num_images: 1
                })
            });

            return response.ok;
        } catch (error) {
            return false;
        }
    }
}

// 전역 API 인스턴스
window.imageAPI = new ImageGenerationAPI();