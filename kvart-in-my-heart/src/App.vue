<template>
  <div class="min-h-screen bg-gray-100 font-sans text-gray-800 flex flex-col">
    <!-- HEADER -->
    <header class="bg-zgblue text-white shadow-md">
      <div class="container mx-auto px-4 py-4 flex flex-col md:flex-row justify-between items-center gap-4">
        <h1 class="text-2xl font-bold flex items-center gap-2">🏙️ Kvart In My ❤️</h1>
        <select v-model="selectedDistrict" @change="fetchData" class="bg-white text-gray-800 rounded px-3 py-2 font-semibold focus:outline-none cursor-pointer">
          <option v-for="district in districts" :key="district" :value="district">{{ district }}</option>
        </select>
      </div>
    </header>

    <!-- MAIN CONTENT -->
    <main class="container mx-auto px-4 py-8 flex-grow">
      
      <!-- TAB NAVIGATION -->
      <div class="flex justify-between items-center mb-6">
        <h2 class="text-xl font-semibold">
          <span v-if="activeTab === 'feed'">Oglasna ploča: </span>
          <span v-else>Prijava problema: </span>
          <span class="text-heartred">{{ selectedDistrict }}</span>
        </h2>
        
        <button v-if="activeTab === 'feed'" @click="activeTab = 'report'" class="bg-heartred text-white px-4 py-2 rounded-lg font-medium hover:bg-red-700 transition">
          Prijavi problem
        </button>
        <button v-else @click="activeTab = 'feed'" class="bg-gray-500 text-white px-4 py-2 rounded-lg font-medium hover:bg-gray-600 transition">
          Natrag na ploču
        </button>
      </div>

      <!-- TAB: FEED -->
      <div v-if="activeTab === 'feed'">
        
        <!-- LOADER -->
        <div v-if="isLoading" class="text-center py-12 text-gray-500 font-medium animate-pulse">
          Dohvaćam podatke s portala Grada Zagreba...
        </div>

        <!-- POSTS GRID -->
        <div v-else class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <div v-for="post in posts" :key="post.id" class="bg-white rounded-xl shadow-sm border border-gray-100 p-5 hover:shadow-md transition">
            <div class="text-xs font-bold uppercase text-gray-500 mb-2">{{ post.source }}</div>
            <h3 class="text-lg font-bold text-gray-800 mb-2">{{ post.title }}</h3>
            <p class="text-gray-600 text-sm mb-4">{{ post.description }}</p>
            <div class="text-xs bg-gray-100 px-2 py-1 rounded inline-block text-gray-600">📍 {{ post.location }}</div>
          </div>

          <!-- EMPTY STATE -->
          <div v-if="posts.length === 0" class="col-span-full text-center py-12 text-gray-500">
            Trenutno nema novih komunalnih obavijesti za ovaj kvart.
          </div>
        </div>
      </div>

      <!-- TAB: REPORT PROBLEM -->
      <div v-if="activeTab === 'report'" class="max-w-2xl mx-auto bg-white p-6 rounded-xl shadow-sm border border-gray-100">
        <h3 class="text-2xl font-bold mb-4">Prijavi komunalni problem</h3>
        <p class="text-gray-600 mb-6">Prijava za kvart <strong>{{ selectedDistrict }}</strong> bit će vidljiva mjesnom odboru i ostalim građanima.</p>
        
        <form @submit.prevent="submitReport" class="space-y-4">
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Kategorija problema</label>
            <select class="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-zgblue focus:outline-none">
              <option>Oštećenje na cesti / Asfalt</option>
              <option>Otpad i čistoća</option>
              <option>Zelenilo i parkovi</option>
              <option>Javna rasvjeta</option>
            </select>
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Opis problema</label>
            <textarea rows="4" class="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-zgblue focus:outline-none" placeholder="Opiši što se točno događa..."></textarea>
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Lokacija (Ulica)</label>
            <input type="text" class="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-zgblue focus:outline-none" placeholder="Npr. Ilica 250">
          </div>
          <button type="submit" class="w-full bg-heartred hover:bg-red-700 text-white font-bold py-3 px-4 rounded-lg transition">
            Pošalji prijavu
          </button>
        </form>
      </div>

    </main>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';

// --- STATE ---
const selectedDistrict = ref('Donji grad');
const activeTab = ref('feed');
const isLoading = ref(false);
const posts = ref([]);

const districts = [
  'Donji grad', 'Gornji grad - Medveščak', 'Trnje', 'Maksimir', 
  'Peščenica - Žitnjak', 'Novi Zagreb - istok', 'Novi Zagreb - zapad', 
  'Trešnjevka - sjever', 'Trešnjevka - jug', 'Črnomerec', 
  'Gornja Dubrava', 'Donja Dubrava', 'Stenjevec', 'Podsused - Vrapče', 
  'Podsljeme', 'Sesvete', 'Brezovica'
];

// --- METHODS ---
const submitReport = () => {
  alert(`Tvoja prijava za kvart ${selectedDistrict.value} je uspješno zabilježena u sustav!`);
  activeTab.value = 'feed';
};

const fetchData = async () => {
  isLoading.value = true;
  posts.value = [];
  
  // Resource ID for 'Male komunalne akcije' from data.zagreb.hr
  const resourceId = '52e56b3a-ad9a-410e-8a83-5f50daac936e'; 
  const apiUrl = `/api/3/action/datastore_search?resource_id=${resourceId}&limit=500`;

  try {
    const response = await fetch(apiUrl);
    
    if (!response.ok) {
      throw new Error(`Server returned status: ${response.status}`);
    }
    
    const data = await response.json();
    const allRecords = data.result.records;

    // Filter records by selected district
    const recordsForDistrict = allRecords.filter(record => {
      const districtAPI = record["Gradska četvrt"];
      return districtAPI && districtAPI.toLowerCase() === selectedDistrict.value.toLowerCase();
    });

    // Map API data structure to our app's format
    posts.value = recordsForDistrict.map(record => {
      return {
        id: record._id,
        source: record["Naslov"] || 'Plan komunalnih akcija',
        title: record["NAMJENA"] || 'Komunalni radovi', 
        description: record["NAMJENA 2"] ? `${record["NAMJENA 2"]} (Procijenjena vrijednost: ${record["VRIJEDNOST U EURIMA"]} €)` : 'Detalji u službenom registru.',
        location: record["LOKACIJA - OBJEKT"] || 'Točna lokacija nije navedena'
      };
    });

  } catch (error) {
    console.error("Error fetching data from API:", error);
    posts.value = [{
      id: 'error',
      source: 'Sustav',
      title: 'Tehnička greška',
      description: `Uzrok pada: ${error.message}`,
      location: 'Sustav'
    }];
  } finally {
    isLoading.value = false;
  }
};

// --- LIFECYCLE HOOKS ---
onMounted(() => {
  fetchData();
});
</script>
