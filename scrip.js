// Galerijas dati un stāvokļa pārvaldība
class GalleryManager {
    constructor() {
        this.images = JSON.parse(localStorage.getItem('galleryImages')) || [];
        this.currentFilter = 'all';
        this.currentSort = 'newest';
        this.currentPage = 1;
        this.itemsPerPage = 20;
        this.currentImageIndex = 0;
        this.isUploading = false;
        
        this.init();
    }
    
    init() {
        this.updateCounter();
        this.renderGallery();
        this.setupEventListeners();
        this.setupDummyData();
    }
    
    setupDummyData() {
        // Pievienojiet šo, lai sāktu ar dažiem parauga attēliem
        if (this.images.length === 0) {
            const dummyImages = [
                {
                    id: 1,
                    name: 'Minimalistiska ainava',
                    url: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=600&h=600&fit=crop',
                    date: '2024-01-15',
                    size: '2.4 MB',
                    resolution: '1920x1080',
                    description: 'Minimalistiska ainava ar pelēkiem toņiem un vienkāršu kompozīciju.',
                    category: 'landscape'
                },
                {
                    id: 2,
                    name: 'Arhitektūras detaļa',
                    url: 'https://images.unsplash.com/photo-1513584684374-8bab748fbf90?w-600&h=600&fit=crop',
                    date: '2024-01-14',
                    size: '3.1 MB',
                    resolution: '2048x1365',
                    description: 'Melnbalta arhitektūras fotografija ar spēcīgiem kontrastiem.',
                    category: 'architecture'
                },
                {
                    id: 3,
                    name: 'Abstrakta tekstūra',
                    url: 'https://images.unsplash.com/photo-1550684848-fac1c5b4e853?w=600&h=600&fit=crop',
                    date: '2024-01-13',
                    size: '1.8 MB',
                    resolution: '1600x1200',
                    description: 'Abstrakta tekstūra pelēkos toņos.',
                    category: 'abstract'
                }
            ];
            
            this.images = dummyImages;
            this.saveToLocalStorage();
            this.renderGallery();
        }
    }
    
    updateCounter() {
        const totalCount = document.getElementById('total-images');
        const footerCount = document.getElementById('footerCounter');
        const count = this.images.length;
        
        if (totalCount) totalCount.textContent = count;
        if (footerCount) footerCount.textContent = count;
        
        // Animated counter
        if (totalCount) {
            totalCount.style.transform = 'scale(1.2)';
            setTimeout(() => {
                totalCount.style.transform = 'scale(1)';
            }, 300);
        }
    }
    
    saveToLocalStorage() {
        localStorage.setItem('galleryImages', JSON.stringify(this.images));
        this.updateCounter();
    }
    
    addImage(file) {
        return new Promise((resolve, reject) => {
            if (this.images.length >= 100) {
                alert('Galerija ir pilna! Maksimālais attēlu skaits ir 100.');
                reject(new Error('Gallery full'));
                return;
            }
            
            if (file.size > 5 * 1024 * 1024) {
                alert('Attēls ir pārāk liels! Maksimālais izmērs ir 5MB.');
                reject(new Error('File too large'));
                return;
            }
            
            const reader = new FileReader();
            
            reader.onload = (e) => {
                const image = new Image();
                image.onload = () => {
                    const newImage = {
                        id: Date.now(),
                        name: file.name.replace(/\.[^/.]+$/, ""),
                        url: e.target.result,
                        date: new Date().toISOString().split('T')[0],
                        size: this.formatFileSize(file.size),
                        resolution: `${image.width}x${image.height}`,
                        description: 'Automātiski pievienots attēls.',
                        category: 'uncategorized',
                        file: file
                    };
                    
                    this.images.unshift(newImage);
                    this.saveToLocalStorage();
                    this.renderGallery();
                    resolve(newImage);
                    
                    // Parādām apstiprinājumu
                    this.showNotification('Attēls veiksmīgi pievienots!');
                };
                image.src = e.target.result;
            };
            
            reader.onerror = reject;
            reader.readAsDataURL(file);
        });
    }
    
    formatFileSize(bytes) {
        if (bytes === 0) return '0 Bytes';
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    }
    
    deleteImage(id) {
        this.images = this.images.filter(img => img.id !== id);
        this.saveToLocalStorage();
        this.renderGallery();
        this.showNotification('Attēls dzēsts!');
    }
    
    getFilteredImages() {
        let filtered = [...this.images];
        
        // Lietot filtrus
        switch (this.currentFilter) {
            case 'recent':
                const weekAgo = new Date();
                weekAgo.setDate(weekAgo.getDate() - 7);
                filtered = filtered.filter(img => new Date(img.date) > weekAgo);
                break;
            case 'landscape':
            case 'portrait':
                filtered = filtered.filter(img => img.category === this.currentFilter);
                break;
        }
        
        // Lietot meklēšanu
        const searchInput = document.getElementById('searchInput');
        if (searchInput && searchInput.value) {
            const searchTerm = searchInput.value.toLowerCase();
            filtered = filtered.filter(img => 
                img.name.toLowerCase().includes(searchTerm) ||
                img.description.toLowerCase().includes(searchTerm)
            );
        }
        
        // Kārtošana
        switch (this.currentSort) {
            case 'newest':
                filtered.sort((a, b) => new Date(b.date) - new Date(a.date));
                break;
            case 'random':
                filtered = this.shuffleArray(filtered);
                break;
            case 'name':
                filtered.sort((a, b) => a.name.localeCompare(b.name));
                break;
        }
        
        return filtered;
    }
    
    shuffleArray(array) {
        const shuffled = [...array];
        for (let i = shuffled.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
        }
        return shuffled;
    }
    
    renderGallery() {
        const grid = document.getElementById('galleryGrid');
        if (!grid) return;
        
        const filteredImages = this.getFilteredImages();
        const startIndex = (this.currentPage - 1) * this.itemsPerPage;
        const endIndex = startIndex + this.itemsPerPage;
        const imagesToShow = filteredImages.slice(startIndex, endIndex);
        
        grid.innerHTML = '';
        
        if (imagesToShow.length === 0) {
            grid.innerHTML = `
                <div class="empty-state" style="grid-column: 1/-1; text-align: center; padding: 4rem;">
                    <i class="fas fa-images" style="font-size: 4rem; color: var(--accent); margin-bottom: 1rem;"></i>
                    <h3 style="margin-bottom: 1rem;">Nav atrasti attēli</h3>
                    <p style="color: var(--lightest-gray);">Pievienojiet pirmos attēlus, izmantojot augšupielādes laukumu virs!</p>
                </div>
            `;
            return;
        }
        
        imagesToShow.forEach((image, index) => {
            const item = document.createElement('div');
            item.className = 'gallery-item';
            item.dataset.id = image.id;
            item.style.animationDelay = `${index * 0.05}s`;
            
            item.innerHTML = `
                <img src="${image.url}" alt="${image.name}" loading="lazy">
                <div class="item-overlay">
                    <div class="item-title">${image.name}</div>
                    <div class="item-date">${image.date}</div>
                    <div class="item-actions">
                        <button class="action-btn view-btn" title="Skatīt">
                            <i class="fas fa-expand"></i>
                        </button>
                        <button class="action-btn download-btn" title="Lejupielādēt">
                            <i class="fas fa-download"></i>
                        </button>
                        <button class="action-btn delete-btn" title="Dzēst">
                            <i class="fas fa-trash"></i>
                        </button>
                    </div>
                </div>
            `;
            
            grid.appendChild(item);
            
            // Pievieno klikšķa notikumu
            item.querySelector('.view-btn').addEventListener('click', (e) => {
                e.stopPropagation();
                this.openModal(this.images.findIndex(img => img.id === image.id));
            });
            
            item.querySelector('.download-btn').addEventListener('click', (e) => {
                e.stopPropagation();
                this.downloadImage(image);
            });
            
            item.querySelector('.delete-btn').addEventListener('click', (e) => {
                e.stopPropagation();
                if (confirm('Vai tiešām vēlaties dzēst šo attēlu?')) {
                    this.deleteImage(image.id);
                }
            });
            
            item.addEventListener('click', () => {
                this.openModal(this.images.findIndex(img => img.id === image.id));
            });
        });
        
        // Parāda/vai paslēpj Load More pogu
        const loadMoreBtn = document.getElementById('loadMore');
        if (loadMoreBtn) {
            if (endIndex < filteredImages.length) {
                loadMoreBtn.style.display = 'block';
            } else {
                loadMoreBtn.style.display = 'none';
            }
        }
    }
    
    openModal(index) {
        this.currentImageIndex = index;
        const image = this.images[index];
        const modal = document.getElementById('imageModal');
        
        if (!image || !modal) return;
        
        document.getElementById('modalTitle').textContent = image.name;
        document.getElementById('modalImage').src = image.url;
        document.getElementById('modalImage').alt = image.name;
        document.getElementById('modalDate').textContent = image.date;
        document.getElementById('modalSize').textContent = image.size;
        document.getElementById('modalResolution').textContent = image.resolution;
        document.getElementById('modalDescription').textContent = image.description;
        
        modal.classList.add('active');
        document.body.style.overflow = 'hidden';
        
        // Atjaunina navigācijas pogas
        this.updateModalNavigation();
    }
    
    closeModal() {
        const modal = document.getElementById('imageModal');
        modal.classList.remove('active');
        document.body.style.overflow = 'auto';
    }
    
    updateModalNavigation() {
        const prevBtn = document.getElementById('prevBtn');
        const nextBtn = document.getElementById('nextBtn');
        
        if (prevBtn) prevBtn.style.display = this.currentImageIndex > 0 ? 'block' : 'none';
        if (nextBtn) nextBtn.style.display = this.currentImageIndex < this.images.length - 1 ? 'block' : 'none';
    }
    
    navigateModal(direction) {
        if (direction === 'prev' && this.currentImageIndex > 0) {
            this.currentImageIndex--;
        } else if (direction === 'next' && this.currentImageIndex < this.images.length - 1) {
            this.currentImageIndex++;
        } else {
            return;
        }
        
        const image = this.images[this.currentImageIndex];
        if (image) {
            document.getElementById('modalTitle').textContent = image.name;
            document.getElementById('modalImage').src = image.url;
            document.getElementById('modalDate').textContent = image.date;
            document.getElementById('modalSize').textContent = image.size;
            document.getElementById('modalResolution').textContent = image.resolution;
            document.getElementById('modalDescription').textContent = image.description;
            
            this.updateModalNavigation();
        }
    }
    
    downloadImage(image) {
        const link = document.createElement('a');
        link.href = image.url;
        link.download = image.name;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        this.showNotification('Lejupielāde sākta!');
    }
    
    async uploadFiles(files) {
        const progressBar = document.querySelector('.progress-bar');
        const uploadProgress = document.getElementById('uploadProgress');
        
        if (!files || files.length === 0) return;
        
        this.isUploading = true;
        uploadProgress.style.display = 'block';
        
        const totalFiles = Math.min(files.length, 100 - this.images.length);
        let uploaded = 0;
        
        for (let i = 0; i < totalFiles; i++) {
            try {
                await this.addImage(files[i]);
                uploaded++;
                
                // Atjaunina progresa joslu
                const progress = (uploaded / totalFiles) * 100;
                progressBar.style.width = `${progress}%`;
                
                // Neliels aizkave, lai parādītu animāciju
                await new Promise(resolve => setTimeout(resolve, 100));
            } catch (error) {
                console.error('Error uploading file:', error);
            }
        }
        
        // Notīra progresa joslu
        setTimeout(() => {
            progressBar.style.width = '0%';
            uploadProgress.style.display = 'none';
        }, 500);
        
        this.isUploading = false;
        
        if (uploaded > 0) {
            this.showNotification(`Veiksmīgi pievienoti ${uploaded} attēli!`);
        }
    }
    
    showNotification(message) {
        // Izveido paziņojuma elementu
        const notification = document.createElement('div');
        notification.className = 'notification';
        notification.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: var(--accent);
            color: var(--black);
            padding: 1rem 1.5rem;
            border-radius: 4px;
            z-index: 3000;
            font-weight: 600;
            transform: translateX(120%);
            transition: transform 0.3s ease;
            box-shadow: 0 5px 15px rgba(0,0,0,0.3);
        `;
        notification.textContent = message;
        document.body.appendChild(notification);
        
        // Parāda paziņojumu
        setTimeout(() => {
            notification.style.transform = 'translateX(0)';
        }, 10);
        
        // Paslēpj paziņojumu pēc 3 sekundēm
        setTimeout(() => {
            notification.style.transform = 'translateX(120%)';
            setTimeout(() => {
                document.body.removeChild(notification);
            }, 300);
        }, 3000);
    }
    
    setupEventListeners() {
        // Augšupielāde
        const uploadInput = document.getElementById('imageUpload');
        const uploadBox = document.getElementById('uploadBox');
        
        if (uploadInput) {
            uploadInput.addEventListener('change', (e) => {
                this.uploadFiles(Array.from(e.target.files));
                e.target.value = ''; // Notīra input
            });
        }
        
        if (uploadBox) {
            // Drag and drop funkcionalitāte
            uploadBox.addEventListener('dragover', (e) => {
                e.preventDefault();
                uploadBox.style.borderColor = 'var(--accent)';
                uploadBox.style.background = 'var(--gray)';
            });
            
            uploadBox.addEventListener('dragleave', (e) => {
                e.preventDefault();
                uploadBox.style.borderColor = 'var(--medium-gray)';
                uploadBox.style.background = '';
            });
            
            uploadBox.addEventListener('drop', (e) => {
                e.preventDefault();
                uploadBox.style.borderColor = 'var(--medium-gray)';
                uploadBox.style.background = '';
                
                const files = Array.from(e.dataTransfer.files);
                this.uploadFiles(files);
            });
        }
        
        // Filtrēšana un meklēšana
        const searchInput = document.getElementById('searchInput');
        const filterSelect = document.getElementById('filterSelect');
        
        if (searchInput) {
            searchInput.addEventListener('input', () => {
                this.renderGallery();
            });
        }
        
        if (filterSelect) {
            filterSelect.addEventListener('change', (e) => {
                this.currentFilter = e.target.value;
                this.renderGallery();
            });
        }
        
        // Kārtošanas pogas
        const sortNewest = document.getElementById('sortNewest');
        const sortRandom = document.getElementById('sortRandom');
        
        if (sortNewest) {
            sortNewest.addEventListener('click', () => {
                this.currentSort = 'newest';
                this.renderGallery();
            });
        }
        
        if (sortRandom) {
            sortRandom.addEventListener('click', () => {
                this.currentSort = 'random';
                this.renderGallery();
            });
        }
        
        // Notīrīšanas poga
        const clearGallery = document.getElementById('clearGallery');
        if (clearGallery) {
            clearGallery.addEventListener('click', () => {
                if (confirm('Vai tiešām vēlaties dzēst VISUS attēlus? Šo darbību nevar atsaukt.')) {
                    this.images = [];
                    this.saveToLocalStorage();
                    this.renderGallery();
                    this.showNotification('Galerija notīrīta!');
                }
            });
        }
        
        // Ielādēt vairāk
        const loadMore = document.getElementById('loadMore');
        if (loadMore) {
            loadMore.addEventListener('click', () => {
                this.currentPage++;
                this.renderGallery();
                
                // Animē pogu
                loadMore.style.transform = 'scale(0.95)';
                setTimeout(() => {
                    loadMore.style.transform = 'scale(1)';
                }, 200);
            });
        }
        
        // Modāļa kontroles
        const closeModal = document.getElementById('closeModal');
        const prevBtn = document.getElementById('prevBtn');
        const nextBtn = document.getElementById('nextBtn');
        const modal = document.getElementById('imageModal');
        const downloadBtn = document.getElementById('downloadBtn');
        const shareBtn = document.getElementById('shareBtn');
        const editBtn = document.getElementById('editBtn');
        
        if (closeModal) {
            closeModal.addEventListener('click', () => this.closeModal());
        }
        
        if (modal) {
            modal.addEventListener('click', (e) => {
                if (e.target === modal) this.closeModal();
            });
        }
        
        if (prevBtn) {
            prevBtn.addEventListener('click', () => this.navigateModal('prev'));
        }
        
        if (nextBtn) {
            nextBtn.addEventListener('click', () => this.navigateModal('next'));
        }
        
        // Klaviatūras navigācija modālajam logam
        document.addEventListener('keydown', (e) => {
            if (!modal.classList.contains('active')) return;
            
            if (e.key === 'Escape') this.closeModal();
            if (e.key === 'ArrowLeft') this.navigateModal('prev');
            if (e.key === 'ArrowRight') this.navigateModal('next');
        });
        
        if (downloadBtn) {
            downloadBtn.addEventListener('click', () => {
                const image = this.images[this.currentImageIndex];
                if (image) this.downloadImage(image);
            });
        }
        
        if (shareBtn) {
            shareBtn.addEventListener('click', () => {
                this.shareImage(this.images[this.currentImageIndex]);
            });
        }
        
        if (editBtn) {
            editBtn.addEventListener('click', () => {
                this.editImage(this.images[this.currentImageIndex].id);
            });
        }
        
        // Navigācijas ritināšana
        document.querySelectorAll('a[href^="#"]').forEach(anchor => {
            anchor.addEventListener('click', function (e) {
                e.preventDefault();
                const targetId = this.getAttribute('href');
                if (targetId === '#') return;
                
                const targetElement = document.querySelector(targetId);
                if (targetElement) {
                    window.scrollTo({
                        top: targetElement.offsetTop - 80,
                        behavior: 'smooth'
                    });
                }
            });
        });
        
        // Temats pārslēgšana
        const themeToggle = document.querySelector('.theme-toggle');
        if (themeToggle) {
            themeToggle.addEventListener('click', () => {
                document.body.classList.toggle('light-theme');
                const icon = themeToggle.querySelector('i');
                if (document.body.classList.contains('light-theme')) {
                    icon.className = 'fas fa-sun';
                    this.showNotification('Gaišais režīms aktivizēts');
                } else {
                    icon.className = 'fas fa-moon';
                    this.showNotification('Tumšais režīms aktivizēts');
                }
            });
        }
    }
    
    shareImage(image) {
        if (navigator.share) {
            navigator.share({
                title: image.name,
                text: 'Apskatiet šo attēlu manā galerijā!',
                url: image.url,
            })
            .then(() => this.showNotification('Attēls kopīgots!'))
            .catch(error => console.log('Sharing failed:', error));
        } else {
            // Fallback - kopē URL uz starpliktuvi
            navigator.clipboard.writeText(image.url)
                .then(() => this.showNotification('Attēla saite nokopēta starpliktuvē!'))
                .catch(err => console.error('Failed to copy:', err));
        }
    }
    
    editImage(id) {
        const image = this.images.find(img => img.id === id);
        if (!image) return;
        
        const newName = prompt('Ievadiet jaunu attēla nosaukumu:', image.name);
        if (newName !== null) {
            image.name = newName;
            
            const newDesc = prompt('Ievadiet jaunu aprakstu:', image.description);
            if (newDesc !== null) {
                image.description = newDesc;
            }
            
            this.saveToLocalStorage();
            this.renderGallery();
            
            // Atjaunina modāli, ja tas ir atvērts
            if (document.getElementById('imageModal').classList.contains('active')) {
                const currentIndex = this.images.findIndex(img => img.id === id);
                if (currentIndex === this.currentImageIndex) {
                    this.openModal(currentIndex);
                }
            }
            
            this.showNotification('Attēls atjaunināts!');
        }
    }
}

// Inicializē galeriju, kad lapa ir ielādēta
document.addEventListener('DOMContentLoaded', () => {
    window.gallery = new GalleryManager();
    
    // Pievieno CSS gaismas režīmam
    const style = document.createElement('style');
    style.textContent = `
        .light-theme {
            --black: #f0f0f0;
            --dark-gray: #e0e0e0;
            --gray: #d0d0d0;
            --medium-gray: #c0c0c0;
            --light-gray: #b0b0b0;
            --lighter-gray: #a0a0a0;
            --lightest-gray: #909090;
            --white: #1a1a1a;
            --pure-white: #0a0a0a;
            --accent: #707070;
        }
        
        .light-theme .notification {
            background: var(--pure-white);
            color: var(--white);
            border: 1px solid var(--medium-gray);
        }
    `;
    document.head.appendChild(style);
    
    // Animē hero ciparus
    const counter = document.getElementById('total-images');
    if (counter) {
        let current = 0;
        const target = parseInt(counter.textContent);
        const increment = target / 50;
        const timer = setInterval(() => {
            current += increment;
            if (current >= target) {
                current = target;
                clearInterval(timer);
            }
            counter.textContent = Math.floor(current);
        }, 20);
    }
});
