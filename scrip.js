// Foto dati
const photos = [
    {
        id: 1,
        title: "Meža celiņš",
        category: "mezs",
        image: "https://images.unsplash.com/photo-1448375240586-882707db888b?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
        description: "Sema meža takas pavasarī"
    },
    {
        id: 2,
        title: "Baltais stārķis",
        category: "putni",
        image: "https://images.unsplash.com/photo-1551085254-e96b210db58a?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
        description: "Stārķis uz veca koka"
    },
    {
        id: 3,
        title: "Ozols",
        category: "koki",
        image: "https://images.unsplash.com/photo-1544551763-46a013bb70d5?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
        description: "Prasts ozols rītausmā"
    },
    {
        id: 4,
        title: "Pilsētas daba",
        category: "mezs",
        image: "https://images.unsplash.com/photo-1518837695005-2083093ee35b?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
        description: "Zaļš parks pilsētā"
    },
    {
        id: 5,
        title: "Ezera krasts",
        category: "udens",
        image: "https://images.unsplash.com/photo-1505142468610-359e7d316be0?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
        description: "Kluss ezers rudenī"
    },
    {
        id: 6,
        title: "Tauriņš",
        category: "putni",
        image: "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
        description: "Tauriņš uz zieda"
    },
    {
        id: 7,
        title: "Migla mežā",
        category: "mezs",
        image: "https://images.unsplash.com/photo-1418065460487-3e41a6c84dc5?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
        description: "Rīta migla skuju mežā"
    },
    {
        id: 8,
        title: "Upes līkums",
        category: "udens",
        image: "https://images.unsplash.com/photo-1470114716159-e389f8712fda?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
        description: "Upe meža vidū"
    }
];

// Mainīgie
let currentFilter = 'all';
let visiblePhotos = 4;

// Elementi
const photoGrid = document.getElementById('photoGrid');
const filterButtons = document.querySelectorAll('.filter-btn');
const loadMoreBtn = document.getElementById('loadMoreBtn');

// Galvenās funkcijas
function initGallery() {
    renderPhotos();
    setupEventListeners();
}

function renderPhotos() {
    photoGrid.innerHTML = '';
    
    const filteredPhotos = currentFilter === 'all' 
        ? photos 
        : photos.filter(photo => photo.category === currentFilter);
    
    const photosToShow = filteredPhotos.slice(0, visiblePhotos);
    
    photosToShow.forEach(photo => {
        const photoItem = document.createElement('div');
        photoItem.className = 'photo-item';
        photoItem.dataset.category = photo.category;
        
        photoItem.innerHTML = `
            <img src="${photo.image}" alt="${photo.title}" loading="lazy">
            <div class="photo-info">
                <h4>${photo.title}</h4>
                <p>${photo.description}</p>
                <span class="photo-category">${getCategoryName(photo.category)}</span>
            </div>
        `;
        
        photoGrid.appendChild(photoItem);
    });
    
    // Pārbaudām, vai ir vēl foto
    if (visiblePhotos >= filteredPhotos.length) {
        loadMoreBtn.style.display = 'none';
    } else {
        loadMoreBtn.style.display = 'inline-block';
    }
}

function getCategoryName(category) {
    const categories = {
        'mezs': 'Mežs',
        'putni': 'Putni',
        'udens': 'Ūdens',
        'koki': 'Koki'
    };
    return categories[category] || category;
}

function setupEventListeners() {
    // Filtrēšana
    filterButtons.forEach(button => {
        button.addEventListener('click', function() {
            filterButtons.forEach(btn => btn.classList.remove('active'));
            this.classList.add('active');
            
            currentFilter = this.dataset.filter;
            visiblePhotos = 4;
            renderPhotos();
        });
    });
    
    // Ielādēt vairāk
    loadMoreBtn.addEventListener('click', function() {
        visiblePhotos += 4;
        renderPhotos();
    });
}

// Palaižam galeriju
document.addEventListener('DOMContentLoaded', initGallery);

// Vienkāršs bildes aizvietošanas ceļvedis
console.log(`
=== KĀ PIEVIENOT SAVAS BILDES ===
1. Ielieciet bildes mapē "images/"
2. Aizstājiet "image" vērtību foto datos:
   image: "images/jusu-foto.jpg"
3. Pievienojiet vairāk foto pie photos masīva
`);
