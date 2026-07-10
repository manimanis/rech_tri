const { createApp, ref, reactive, computed, watch, onMounted, nextTick } = Vue;

const ALGO_METADATA = {
    bubble: {
        title: "TriABulles_Optimise.algo",
        worst: 'O(n²)', avg: 'O(n²)', best: 'O(n)', labelStat4: 'Tri stable', stat4: 'Oui',
        notes: "Le <strong>Tri à bulles optimisé</strong> fait remonter progressivement les plus grands éléments vers la fin du tableau.<br><br>👉 <strong>L'optimisation clé</strong> : On utilise un indicateur booléen (<code>Permut</code>) pour détecter si le tableau est entièrement trié. Si une passe complète s'effectue sans aucune permutation, l'algorithme s'arrête instantanément.",
        code: [
            "Répéter",
            "  trié ← Vrai",
            "  Pour j de 0 à N - 2 Faire",
            "    Si T[j] > T[j+1] Alors",
            "      Permuter(T[j], T[j+1])",
            "      trié ← Faux",
            "    Fin Si",
            "  Fin Pour",
            "  N ← N - 1",
            "Jusqu'à trié"
        ]
    },
    selection: {
        title: "TriParSelection.algo",
        worst: 'O(n²)', avg: 'O(n²)', best: 'O(n²)', labelStat4: 'Tri stable', stat4: 'Non',
        notes: "Le <strong>Tri par sélection</strong> divise le tableau en une partie triée (à gauche) et non triée (à droite).<br><br>👉 <strong>Clarté Visuelle</strong> : Observez la différence entre la colonne en <strong>Cyan</strong> (le <em>Minimum Provisoire</em> trouvé jusqu'ici) et la colonne en <strong>Orange</strong> (l'élément actuellement inspecté par la boucle).",
        code: [
            "Pour i de 0 à (N - 2) Faire",
            "  Min ← i",
            "  Pour j de (i + 1) à (N - 1) Faire",
            "    Si T[j] < T[Min] Alors",
            "      Min ← j  // Nouveau minimum !",
            "    Fin Si",
            "  Fin Pour",
            "  Si Min ≠ i Alors",
            "    Permuter(T[i], T[Min])",
            "  Fin Si",
            "Fin Pour"
        ]
    },
    insertion: {
        title: "TriParInsertion.algo",
        worst: 'O(n²)', avg: 'O(n²)', best: 'O(n)', labelStat4: 'Tri stable', stat4: 'Oui',
        notes: "Le <strong>Tri par insertion</strong> construit progressivement le tableau trié à gauche. On sélectionne une 'Clé' (mise en mémoire temporaire) et on la fait glisser à sa place en décalant vers la droite les éléments plus grands.<br><br>👉 <em>Observation pédagogique</em> : C'est la méthode naturelle qu'utilise un joueur de cartes pour trier sa main.",
        code: [
            "Pour i de 1 à (N - 1) Faire",
            "  Cle ← T[i]",
            "  j ← i - 1",
            "  Tant Que (j ≥ 0 et T[j] > Cle) Faire",
            "    T[j+1] ← T[j]  // Décalage",
            "    j ← j - 1",
            "  Fin Tant Que",
            "  T[j+1] ← Cle  // Insertion",
            "Fin Pour"
        ]
    },
    sequential: {
        title: "RechercheSequentielle.algo",
        worst: 'O(n)', avg: 'O(n)', best: 'O(1)', labelStat4: 'Mémoire extra', stat4: 'O(1)',
        notes: "La <strong>Recherche Séquentielle</strong> inspecte chaque case du tableau une par une, de la première à la dernière.<br><br>👉 <strong>Avantage majeur</strong> : Fonctionne parfaitement sur n'importe quel tableau, même totalement désordonné.<br>👉 <strong>Inconvénient</strong> : Lenteur sur de très gros volumes de données.",
        code: [
            "p ← -1",
            "i ← 0",
            "Tant Que p = -1 et i < N Faire",
            "  Si T[i] = Cible Alors p ← i Fin Si",
            "  i ← i + 1",
            "Fin Tant Que",
            "Retourner p"
        ]
    },
    binary: {
        title: "RechercheDichotomique.algo",
        worst: 'O(log n)', avg: 'O(log n)', best: 'O(1)', labelStat4: 'Prérequis', stat4: 'Tableau Trié',
        notes: "La <strong>Recherche Dichotomique</strong> (Binary Search) coupe l'intervalle de recherche en deux à chaque étape.<br><br>👉 <strong>Condition absolue</strong> : Le tableau <em>doit obligatoirement être trié</em> !<br>👉 <strong>Puissance spectaculaire</strong> : Sur 1 million d'éléments, il suffit de seulement 20 comparaisons maximum pour trouver n'importe quelle valeur !",
        code: [
            "G ← 0",
            "D ← N - 1",
            "p ← -1",
            "Tant Que p = -1 et G ≤ D Faire",
            "  M ← (G + D) div 2",
            "  Si T[M] = Cible Alors",
            "    p ← M",
            "  Sinon Si T[M] < Cible Alors",
            "    G ← M + 1",
            "  Sinon",
            "    D ← M - 1",
            "  Fin Si",
            "Fin Tant Que",
            "Retourner p"
        ]
    }
};

const ITEM_WIDTH = 46;
const ITEM_GAP = 12;
const CONTAINER_MAX_HEIGHT = 200;

function uid() {
    return Math.random().toString(36).substr(2, 5);
}

function cloneArray(arr) {
    return arr.map(item => ({ ...item }));
}

// ============================================================
// APPLICATION VUE
// ============================================================
const app = createApp({
    setup() {
        // ---- State réactif ----
        const currentMode = ref('sort');
        const currentAlgo = ref('bubble');
        const initialValues = ref([]);
        const simulationSteps = ref([]);
        const currentStepIndex = ref(0);
        const isPlaying = ref(false);
        const searchTarget = ref(24);
        const soundEnabled = ref(true);
        const arraySize = ref(8);
        const speedLevel = ref(3);
        const customInput = ref('');

        let playInterval = null;
        let audioCtx = null;

        // ---- Propriétés calculées ----
        const currentStep = computed(() => {
            if (simulationSteps.value.length === 0) return null;
            return simulationSteps.value[currentStepIndex.value];
        });

        const currentArray = computed(() => {
            if (!currentStep.value) return [];
            return currentStep.value.array;
        });

        const isSearch = computed(() => currentMode.value === 'search');

        const algoData = computed(() => ALGO_METADATA[currentAlgo.value]);

        const totalWidth = computed(() => {
            const len = currentArray.value.length;
            return len * ITEM_WIDTH + (len - 1) * ITEM_GAP;
        });

        const maxVal = computed(() => {
            const arr = currentArray.value;
            const vals = [];
            arr.forEach(x => { if (x.val !== null) vals.push(x.val); });
            if (currentStep.value && currentStep.value.tempItem && currentStep.value.tempItem.val !== null) {
                vals.push(currentStep.value.tempItem.val);
            }
            return vals.length > 0 ? Math.max(...vals) : 40;
        });

        const algoCategoryLabel = computed(() => {
            return isSearch.value ? 'Algorithmes de Recherche' : 'Algorithmes de Tri';
        });

        const defaultCommentText = "Cliquez sur « Démarrer » ou utilisez les boutons ci-dessous pour lancer la simulation.";

        const isSelectionAlgo = computed(() => currentAlgo.value === 'selection');
        const isInsertionAlgo = computed(() => currentAlgo.value === 'insertion');

        // ---- Pointer styles pour le template ----
        const binaryPointerStyle = computed(() => {
            return (key, offset) => {
                const step = currentStep.value;
                if (!step || !step.pointers || currentMode.value !== 'search') {
                    return { opacity: 0 };
                }
                const arr = currentArray.value;
                const idx = step.pointers[key];
                if (idx === undefined || idx < 0 || idx >= arr.length) {
                    return { opacity: 0 };
                }
                const arena = document.getElementById('arena-box');
                if (!arena) return { opacity: 0, left: '0px', top: '10px' };
                const arenaWidth = arena.offsetWidth;
                const innerLeft = (arenaWidth - totalWidth.value) / 2;
                const x = innerLeft + idx * (ITEM_WIDTH + ITEM_GAP) + ITEM_WIDTH / 2;
                const { G, D, M } = step.pointers;
                let top = '10px';
                if (key === 'M') {
                    if (M === G && M === D) top = '86px';
                    else if (M === G || M === D) top = '48px';
                } else if (key === 'D') {
                    if (D === G) top = '48px';
                }
                return { opacity: 1, left: x + 'px', top, transform: 'translateX(-50%)' };
            };
        });

        const seqPointerStyle = computed(() => {
            const step = currentStep.value;
            if (!step || !step.pointers || currentMode.value !== 'search') {
                return { opacity: 0 };
            }
            const arr = currentArray.value;
            const idx = step.pointers.I;
            if (idx === undefined || idx < 0 || idx >= arr.length) {
                return { opacity: 0 };
            }
            const arena = document.getElementById('arena-box');
            if (!arena) return { opacity: 0 };
            const arenaWidth = arena.offsetWidth;
            const innerLeft = (arenaWidth - totalWidth.value) / 2;
            const x = innerLeft + idx * (ITEM_WIDTH + ITEM_GAP) + ITEM_WIDTH / 2;
            return { opacity: 1, left: x + 'px', top: '25px', transform: 'translateX(-50%) scale(1.08)' };
        });

        const selMinPointerStyle = computed(() => {
            const step = currentStep.value;
            if (!step || !step.pointers || currentAlgo.value !== 'selection') {
                return { opacity: 0 };
            }
            const arr = currentArray.value;
            const idx = step.pointers.Min;
            if (idx === undefined || idx < 0 || idx >= arr.length) {
                return { opacity: 0 };
            }
            const arena = document.getElementById('arena-box');
            if (!arena) return { opacity: 0 };
            const arenaWidth = arena.offsetWidth;
            const innerLeft = (arenaWidth - totalWidth.value) / 2;
            const x = innerLeft + idx * (ITEM_WIDTH + ITEM_GAP) + ITEM_WIDTH / 2;
            return { opacity: 1, left: x + 'px', top: '10px', transform: 'translateX(-50%) scale(1.08)' };
        });

        const selRunnerPointerStyle = computed(() => {
            const step = currentStep.value;
            if (!step || !step.pointers || currentAlgo.value !== 'selection') {
                return { opacity: 0 };
            }
            const arr = currentArray.value;
            const idx = step.pointers.Runner;
            if (idx === undefined || idx < 0 || idx >= arr.length) {
                return { opacity: 0 };
            }
            const arena = document.getElementById('arena-box');
            if (!arena) return { opacity: 0 };
            const arenaWidth = arena.offsetWidth;
            const innerLeft = (arenaWidth - totalWidth.value) / 2;
            const x = innerLeft + idx * (ITEM_WIDTH + ITEM_GAP) + ITEM_WIDTH / 2;
            const minIdx = step.pointers.Min;
            const top = (idx === minIdx) ? '48px' : '10px';
            return { opacity: 1, left: x + 'px', top, transform: 'translateX(-50%) scale(1.08)' };
        });

        const tempItemLeft = computed(() => {
            const container = document.getElementById('array-inner-container');
            if (!container) return 0;
            return container.offsetWidth / 2 - ITEM_WIDTH / 2;
        });

        const tempItemHeight = computed(() => {
            const step = currentStep.value;
            if (!step || !step.tempItem || step.tempItem.val === null) return 24;
            return Math.max(24, Math.floor((step.tempItem.val / maxVal.value) * CONTAINER_MAX_HEIGHT));
        });

        // ---- Web Audio ----
        function initAudio() {
            if (!audioCtx && soundEnabled.value) {
                audioCtx = new (window.AudioContext || window.webkitAudioContext)();
            }
        }

        function toggleSound() {
            soundEnabled.value = !soundEnabled.value;
            if (soundEnabled.value) playTone(20, 'found');
        }

        const furElise = [
            // Partie A
            659.25, 622.25, 659.25, 622.25, 659.25, 493.88, 587.33, 523.25, 440.00,
            261.63, 329.63, 440.00, 493.88,
            329.63, 415.30, 493.88, 523.25,
            329.63, 659.25, 622.25, 659.25, 622.25, 659.25, 493.88, 587.33, 523.25, 440.00,
            261.63, 329.63, 440.00, 493.88,
            329.63, 523.25, 493.88, 440.00,
            
            // Partie B
            493.88, 523.25, 587.33, 659.25,
            392.00, 698.46, 659.25, 587.33,
            349.23, 659.25, 587.33, 523.25,
            329.63, 587.33, 523.25, 493.88,
            329.63, 659.25,
            
            // Retour Partie A
            659.25, 622.25, 659.25, 622.25, 659.25, 493.88, 587.33, 523.25, 440.00,
            261.63, 329.63, 440.00, 493.88,
            329.63, 415.30, 493.88, 523.25,
            329.63, 659.25, 622.25, 659.25, 622.25, 659.25, 493.88, 587.33, 523.25, 440.00,
            261.63, 329.63, 440.00, 493.88,
            329.63, 523.25, 493.88, 440.00
        ];
        let melodyIndex = 0;

        function playTone(val, toneType) {
            if (!soundEnabled.value) return;
            try {
                initAudio();
                if (audioCtx.state === 'suspended') audioCtx.resume();
                const osc = audioCtx.createOscillator();
                const gain = audioCtx.createGain();
                
                const freq = furElise[melodyIndex % furElise.length];
                melodyIndex++;
                
                osc.frequency.setValueAtTime(freq, audioCtx.currentTime);
                osc.type = 'sine';
                
                // Un gain fixe pour toutes les notes, avec une chute pour séparer les notes
                gain.gain.setValueAtTime(0.08, audioCtx.currentTime);
                gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.15);
                
                osc.connect(gain);
                gain.connect(audioCtx.destination);
                osc.start();
                osc.stop(audioCtx.currentTime + 0.15);
            } catch (e) { /* ignore */ }
        }

        // ---- Génération de données ----
        function generateRandomArray(size) {
            const arr = [];
            for (let i = 0; i < size; i++) {
                arr.push({ id: `item-${i}-${uid()}`, val: Math.floor(Math.random() * 43) + 6 });
            }
            initialValues.value = arr;
            const randItem = arr[Math.floor(Math.random() * arr.length)];
            searchTarget.value = randItem ? randItem.val : 24;
            checkBinaryInvariant();
        }

        function generatePresetArray(type, size) {
            let arr = [];
            if (type === 'sorted') {
                for (let i = 0; i < size; i++) arr.push({ id: `item-${i}-${uid()}`, val: (i + 1) * 4 });
            } else if (type === 'reversed') {
                for (let i = 0; i < size; i++) arr.push({ id: `item-${i}-${uid()}`, val: (size - i) * 4 });
            } else if (type === 'nearly') {
                for (let i = 0; i < size; i++) arr.push({ id: `item-${i}-${uid()}`, val: (i + 1) * 4 });
                if (size >= 4) {
                    const mid = Math.floor(size / 2);
                    const temp = arr[mid];
                    arr[mid] = arr[mid - 1];
                    arr[mid - 1] = temp;
                }
            }
            initialValues.value = arr;
            const randItem = arr[Math.floor(Math.random() * arr.length)];
            searchTarget.value = randItem ? randItem.val : 24;
            checkBinaryInvariant();
        }

        function applyCustomArray() {
            const str = customInput.value.trim();
            if (!str) return;
            const parts = str.split(',').map(s => parseInt(s.trim())).filter(n => !isNaN(n));
            if (parts.length < 2) { alert("Veuillez entrer au moins 2 nombres valides."); return; }
            if (parts.length > 15) { alert("Limité à 15 nombres maximum."); return; }
            pauseSimulation();
            initialValues.value = parts.map((val, i) => ({ id: `item-${i}-${uid()}`, val }));
            arraySize.value = parts.length;
            searchTarget.value = initialValues.value[0] ? initialValues.value[0].val : 24;
            checkBinaryInvariant();
            runAlgorithm();
            renderStep(0);
        }

        function checkBinaryInvariant() {
            const toast = document.getElementById('toast-container');
            if (currentAlgo.value === 'binary') {
                let sorted = true;
                const arr = initialValues.value;
                for (let k = 0; k < arr.length - 1; k++) {
                    if (arr[k].val > arr[k + 1].val) { sorted = false; break; }
                }
                if (!sorted) {
                    arr.sort((a, b) => a.val - b.val);
                    initialValues.value = [...arr];
                    toast.innerHTML = `<div class="toast-info">⚡ Astuce Pédagogique : Le tableau a été automatiquement ordonné dans l'ordre croissant, car la recherche dichotomique l'exige impérativement.</div>`;
                    setTimeout(() => { toast.innerHTML = ''; }, 6000);
                } else {
                    toast.innerHTML = '';
                }
            } else {
                const toast = document.getElementById('toast-container');
                if (toast) toast.innerHTML = '';
            }
        }

        // ---- Génération des simulations ----
        function runAlgorithm() {
            melodyIndex = 0;
            simulationSteps.value = [];
            let arr = cloneArray(initialValues.value);

            const isSearch = currentMode.value === 'search';

            simulationSteps.value.push({
                array: cloneArray(arr),
                sortedIndices: [],
                activeIndices: [],
                actionIndices: [],
                selectionMinIndex: -1,
                eliminatedIndices: [],
                foundIndex: -1,
                pointers: null,
                tempItem: null,
                actionTone: null,
                actionToneVal: 20,
                comment: `<strong>État initial</strong> : Tableau de ${arr.length} éléments. ${isSearch ? `Prêt à rechercher la valeur cible <strong>${searchTarget.value}</strong>.` : `Cliquez sur "Suivant" ou "Lecture Automatique" pour démarrer.`}`,
                highlightCode: -1
            });

            const algo = currentAlgo.value;
            if (algo === 'bubble') simulateBubble(arr);
            else if (algo === 'selection') simulateSelection(arr);
            else if (algo === 'insertion') simulateInsertion(arr);
            else if (algo === 'sequential') simulateSequential(arr);
            else if (algo === 'binary') simulateBinary(arr);

            if (currentMode.value === 'sort') {
                const finalIndices = arr.map((_, i) => i);
                simulationSteps.value.push({
                    array: cloneArray(arr),
                    sortedIndices: finalIndices,
                    activeIndices: [],
                    actionIndices: [],
                    selectionMinIndex: -1,
                    eliminatedIndices: [],
                    foundIndex: -1,
                    pointers: null,
                    tempItem: null,
                    actionTone: 'found',
                    actionToneVal: 40,
                    comment: "🎉 <strong>Tri terminé avec succès !</strong> Tous les éléments sont maintenant ordonnés à leur position définitive.",
                    highlightCode: -1
                });
            }
        }

        // -- Algorithmes --
        function simulateBubble(arr) {
            const n = arr.length;
            let sortedSet = new Set();
            let swapped = true;
            let limite = n - 1;

            pushStep(arr, sortedSet, [], [], 'compare', 15,
                `Début de la boucle : on répète le parcours tant que le tableau n'est pas trié. (N = ${limite + 1})`, 0);

            while (swapped && limite >= 1) {
                swapped = false;
                pushStep(arr, sortedSet, [], [], 'compare', 20,
                    `Nouvelle passe. On suppose que le tableau est trié : on initialise <strong>trié ← Vrai</strong>.`, 1);

                for (let j = 0; j < limite; j++) {
                    pushStep(arr, sortedSet, [j, j + 1], [], 'compare', arr[j].val,
                        `On compare <strong>T[${j}]</strong> (${arr[j].val}) avec <strong>T[${j+1}]</strong> (${arr[j+1].val}).`, 3);

                    if (arr[j].val > arr[j + 1].val) {
                        swapped = true;
                        pushStep(arr, sortedSet, [], [j, j + 1], 'swap', Math.max(arr[j].val, arr[j + 1].val),
                            `Comme <strong>${arr[j].val} > ${arr[j+1].val}</strong>, on effectue une permutation.`, 4);
                        const temp = arr[j];
                        arr[j] = arr[j + 1];
                        arr[j + 1] = temp;
                        pushStep(arr, sortedSet, [], [j, j + 1], 'compare', 25,
                            `Permutation réalisée, le tableau n'était donc pas totalement trié : on note <strong>trié ← Faux</strong>.`, 5);
                    } else {
                        pushStep(arr, sortedSet, [j, j + 1], [], 'compare', arr[j + 1].val,
                            `<strong>${arr[j].val} ≤ ${arr[j+1].val}</strong>, ils sont dans le bon ordre.`, 3);
                    }
                }

                sortedSet.add(limite);

                if (!swapped) {
                    for (let k = 0; k <= limite; k++) sortedSet.add(k);
                    pushStep(arr, sortedSet, [], [], 'found', 40,
                        `💡 <strong>Optimisation activée</strong> : <strong>trié</strong> est resté Vrai pendant toute cette passe. Le tableau est donc déjà entièrement trié ! On s'arrête (Jusqu'à trié).`, 9);
                    break;
                } else {
                    pushStep(arr, sortedSet, [], [], 'found', arr[limite].val,
                        `✨ Fin de la passe. L'élément <strong>${arr[limite].val}</strong> est à sa position définitive (vert). On réduit la zone de tri : <strong>N ← N - 1</strong>.`, 8);
                }
                limite--;
            }
            for (let k = 0; k < n; k++) sortedSet.add(k);
        }

        function simulateSelection(arr) {
            const n = arr.length;
            let sortedSet = new Set();
            for (let i = 0; i < n - 1; i++) {
                let minIdx = i;
                pushStepSel(arr, sortedSet, [], [], minIdx, { Min: minIdx }, 'compare', arr[i].val,
                    `Début de l'étape ${i+1}. On initialise le minimum : <strong>Min ← ${i}</strong> (valeur : ${arr[i].val}).`, 1);
                for (let j = i + 1; j < n; j++) {
                    pushStepSel(arr, sortedSet, [j], [], minIdx, { Min: minIdx, Runner: j }, 'compare', arr[j].val,
                        `On vérifie si <strong>T[j] < T[Min]</strong> (T[${j}] = ${arr[j].val} comparé à T[${minIdx}] = ${arr[minIdx].val}).`, 3);
                    if (arr[j].val < arr[minIdx].val) {
                        minIdx = j;
                        pushStepSel(arr, sortedSet, [], [], minIdx, { Min: minIdx }, 'found', arr[minIdx].val,
                            `💡 Nouveau minimum trouvé ! On met à jour : <strong>Min ← ${minIdx}</strong>.`, 4);
                    }
                }
                if (minIdx !== i) {
                    pushStepSel(arr, sortedSet, [], [i, minIdx], -1, { Min: minIdx, Runner: i }, 'swap', Math.max(arr[i].val, arr[minIdx].val),
                        `Le parcours est terminé. Comme <strong>Min ≠ i</strong> (${minIdx} ≠ ${i}), on va Permuter(T[i], T[Min]).`, 7);
                    const temp = arr[i];
                    arr[i] = arr[minIdx];
                    arr[minIdx] = temp;
                    pushStepSel(arr, sortedSet, [], [i, minIdx], -1, null, 'found', arr[i].val, `Permutation réalisée avec succès.`, 8);
                } else {
                    pushStepSel(arr, sortedSet, [], [], minIdx, null, 'found', arr[i].val,
                        `Le parcours est terminé. <strong>Min = i</strong>, donc aucune permutation n'est nécessaire.`, 7);
                }
                sortedSet.add(i);
            }
            sortedSet.add(n - 1);
        }

        function simulateInsertion(arr) {
            const n = arr.length;
            let sortedSet = new Set([0]);
            for (let i = 1; i < n; i++) {
                const currentItem = { ...arr[i] };
                const keyVal = currentItem.val;
                arr[i] = { id: `empty-${i}-${uid()}`, val: null };
                pushStepIns(arr, sortedSet, [], [], currentItem, 'swap', keyVal,
                    `On sauvegarde T[${i}] dans la Clé : <strong>Cle ← ${keyVal}</strong> et on initialise <strong>j ← ${i - 1}</strong>.`, 1);
                let j = i - 1;
                while (j >= 0) {
                    pushStepIns(arr, sortedSet, [j], [], currentItem, 'compare', arr[j].val,
                        `Condition du Tant Que : <strong>j ≥ 0 et T[j] > Cle</strong> ? (j=${j}, T[j]=${arr[j].val}, Cle=${keyVal}).`, 3);
                    if (arr[j].val > keyVal) {
                        pushStepIns(arr, sortedSet, [], [j], currentItem, 'swap', arr[j].val,
                            `Condition vraie. On effectue le décalage : <strong>T[j+1] ← T[j]</strong>.`, 4);
                        arr[j + 1] = arr[j];
                        arr[j] = { id: `empty-${j}-${uid()}`, val: null };
                        pushStepIns(arr, sortedSet, [], [j + 1], currentItem, 'compare', 20,
                            `Décalage effectué. On décrémente l'index : <strong>j ← j - 1</strong> (j vaut ${j - 1}).`, 5);
                        j--;
                    } else {
                        pushStepIns(arr, sortedSet, [j], [], currentItem, 'compare', keyVal,
                            `Condition fausse (T[j] ≤ Cle). On arrête les décalages.`, 3);
                        break;
                    }
                }
                arr[j + 1] = currentItem;
                sortedSet.add(i);
                pushStepIns(arr, sortedSet, [], [j + 1], null, 'found', keyVal,
                    `✨ <strong>T[j+1] ← Cle</strong> : On insère la Clé (${keyVal}) à sa position définitive.`, 7);
            }
        }

        function simulateSequential(arr) {
            const n = arr.length;
            const eliminated = [];
            pushStepSearch(arr, [], eliminated, -1, null, 'compare', 15,
                `Initialisation de la recherche : <strong>p ← -1</strong> et <strong>i ← 0</strong>.`, 0);
            let found = false;
            for (let i = 0; i < n; i++) {
                pushStepSearch(arr, [i], eliminated, -1, { I: i }, 'compare', arr[i].val,
                    `On vérifie si <strong>T[i] = Cible</strong> (T[${i}] = ${arr[i].val} comparé à ${searchTarget.value}).`, 3);
                if (arr[i].val === searchTarget.value) {
                    pushStepSearch(arr, [], eliminated, i, { I: i }, 'found', 45,
                        `🎉 <strong>SUCCÈS !</strong> T[i] = Cible. On enregistre la position : <strong>p ← ${i}</strong>.`, 3);
                    found = true;
                    break;
                } else {
                    eliminated.push(i);
                    pushStepSearch(arr, [], eliminated, -1, { I: i }, 'compare', 10,
                        `T[i] ≠ Cible. On incrémente l'index pour continuer : <strong>i ← i + 1</strong> (i vaut ${i + 1}).`, 4);
                }
            }
            if (!found) {
                pushStepSearch(arr, [], eliminated, -1, null, 'fail', 10,
                    `❌ <strong>ÉCHEC</strong> : La boucle s'est terminée avec p toujours à -1. L'élément est introuvable, on va <strong>Retourner p</strong>.`, 6);
            }
        }

        function simulateBinary(arr) {
            const n = arr.length;
            let g = 0, d = n - 1;
            const eliminated = [];
            pushStepSearch(arr, [], eliminated, -1, { G: g, D: d }, 'compare', 20,
                `Initialisation : <strong>G ← 0</strong>, <strong>D ← ${d}</strong> et <strong>p ← -1</strong>. L'intervalle actif est [0 ... ${d}].`, 0);
            let found = false;
            while (g <= d) {
                const m = Math.floor((g + d) / 2);
                pushStepSearch(arr, [m], eliminated, -1, { G: g, D: d, M: m }, 'compare', arr[m].val,
                    `On calcule l'index du Milieu : <strong>M ← (G + D) div 2</strong> = ${m} (T[M] = ${arr[m].val}).`, 4);
                pushStepSearch(arr, [m], eliminated, -1, { G: g, D: d, M: m }, 'compare', arr[m].val,
                    `On vérifie si <strong>T[M] = Cible</strong> (${arr[m].val} = ${searchTarget.value} ?).`, 5);
                if (arr[m].val === searchTarget.value) {
                    pushStepSearch(arr, [], eliminated, m, { G: g, D: d, M: m }, 'found', 45,
                        `🎉 <strong>SUCCÈS !</strong> T[M] = Cible. On enregistre la position : <strong>p ← M</strong> (${m}).`, 6);
                    found = true; break;
                } else if (arr[m].val < searchTarget.value) {
                    for (let k = g; k <= m; k++) eliminated.push(k);
                    pushStepSearch(arr, [], eliminated, -1, { G: m + 1, D: d, M: m }, 'swap', arr[m].val,
                        `Comme T[M] < Cible, la cible est à droite. On ajuste : <strong>G ← M + 1</strong> (${m + 1}).`, 8);
                    g = m + 1;
                } else {
                    for (let k = m; k <= d; k++) eliminated.push(k);
                    pushStepSearch(arr, [], eliminated, -1, { G: g, D: m - 1, M: m }, 'swap', arr[m].val,
                        `Comme T[M] > Cible, la cible est à gauche. On ajuste : <strong>D ← M - 1</strong> (${m - 1}).`, 10);
                    d = m - 1;
                }
            }
            if (!found) {
                for (let k = 0; k < n; k++) { if (!eliminated.includes(k)) eliminated.push(k); }
                pushStepSearch(arr, [], eliminated, -1, { G: g, D: d }, 'fail', 10,
                    `❌ <strong>ÉCHEC</strong> : G > D (${g} > ${d}). La boucle s'arrête, p reste à -1. L'élément est introuvable.`, 13);
            }
        }

        // Helpers pour pushStep
        function pushStep(arr, sorted, active, action, tone, toneVal, comment, codeLine) {
            simulationSteps.value.push({
                array: cloneArray(arr),
                sortedIndices: Array.from(sorted),
                activeIndices: active,
                actionIndices: action,
                selectionMinIndex: -1,
                eliminatedIndices: [],
                foundIndex: -1,
                pointers: null,
                tempItem: null,
                actionTone: tone,
                actionToneVal: toneVal,
                comment,
                highlightCode: codeLine
            });
        }

        function pushStepSel(arr, sorted, active, action, selMin, pointers, tone, toneVal, comment, codeLine) {
            simulationSteps.value.push({
                array: cloneArray(arr),
                sortedIndices: Array.from(sorted),
                activeIndices: active,
                actionIndices: action,
                selectionMinIndex: selMin,
                eliminatedIndices: [],
                foundIndex: -1,
                pointers: pointers,
                tempItem: null,
                actionTone: tone,
                actionToneVal: toneVal,
                comment,
                highlightCode: codeLine
            });
        }

        function pushStepIns(arr, sorted, active, action, tempItem, tone, toneVal, comment, codeLine) {
            simulationSteps.value.push({
                array: cloneArray(arr),
                sortedIndices: Array.from(sorted),
                activeIndices: active,
                actionIndices: action,
                selectionMinIndex: -1,
                eliminatedIndices: [],
                foundIndex: -1,
                pointers: null,
                tempItem: tempItem ? { ...tempItem } : null,
                actionTone: tone,
                actionToneVal: toneVal,
                comment,
                highlightCode: codeLine
            });
        }

        function pushStepSearch(arr, active, eliminated, found, pointers, tone, toneVal, comment, codeLine) {
            simulationSteps.value.push({
                array: cloneArray(arr),
                sortedIndices: [],
                activeIndices: active,
                actionIndices: [],
                selectionMinIndex: -1,
                eliminatedIndices: [...eliminated],
                foundIndex: found,
                pointers: pointers,
                tempItem: null,
                actionTone: tone,
                actionToneVal: toneVal,
                comment,
                highlightCode: codeLine
            });
        }

        // ---- Navigation dans les étapes ----
        function renderStep(idx) {
            if (idx < 0) idx = 0;
            if (idx >= simulationSteps.value.length) idx = simulationSteps.value.length - 1;
            currentStepIndex.value = idx;
            const step = simulationSteps.value[idx];
            if (step) {
                playTone(step.actionToneVal || 20, step.actionTone || 'compare');
                nextTick(() => {
                    if (step.highlightCode !== -1) {
                        const lineEl = document.getElementById('code-line-' + step.highlightCode);
                        if (lineEl) {
                            lineEl.scrollIntoView({ behavior: 'smooth', block: 'center' });
                        }
                    }
                });
            }
        }

        function stepNext() {
            if (currentStepIndex.value < simulationSteps.value.length - 1) {
                renderStep(currentStepIndex.value + 1);
            }
        }

        function stepPrev() {
            if (currentStepIndex.value > 0) {
                renderStep(currentStepIndex.value - 1);
            }
        }

        function goToStart() {
            pauseSimulation();
            renderStep(0);
        }

        function goToEnd() {
            pauseSimulation();
            renderStep(simulationSteps.value.length - 1);
        }

        function togglePlay() {
            if (isPlaying.value) {
                pauseSimulation();
            } else {
                if (currentStepIndex.value >= simulationSteps.value.length - 1) renderStep(0);
                startSimulation();
            }
        }

        function startSimulation() {
            isPlaying.value = true;
            const intervalMs = [1500, 1000, 600, 300, 120][speedLevel.value - 1];
            playInterval = setInterval(() => {
                if (currentStepIndex.value < simulationSteps.value.length - 1) {
                    stepNext();
                } else {
                    pauseSimulation();
                }
            }, intervalMs);
        }

        function pauseSimulation() {
            isPlaying.value = false;
            if (playInterval) {
                clearInterval(playInterval);
                playInterval = null;
            }
        }

        // ---- Gestion des onglets ----
        function switchMode(mode) {
            currentMode.value = mode;
            if (mode === 'sort') {
                const activeSort = document.querySelector('#tabs-sort .spec-tab.active') || document.querySelector('#tabs-sort .spec-tab');
                if (activeSort) currentAlgo.value = activeSort.dataset.algo;
            } else {
                const activeSearch = document.querySelector('#tabs-search .spec-tab.active') || document.querySelector('#tabs-search .spec-tab');
                if (activeSearch) currentAlgo.value = activeSearch.dataset.algo;
            }
            checkBinaryInvariant();
            pauseSimulation();
            runAlgorithm();
            renderStep(0);
        }

        function switchAlgo(algo) {
            currentAlgo.value = algo;
            checkBinaryInvariant();
            pauseSimulation();
            runAlgorithm();
            renderStep(0);
        }

        function onSizeChange(newSize) {
            arraySize.value = parseInt(newSize);
            pauseSimulation();
            generateRandomArray(arraySize.value);
            runAlgorithm();
            renderStep(0);
        }

        function onRandom() {
            pauseSimulation();
            generateRandomArray(arraySize.value);
            runAlgorithm();
            renderStep(0);
        }

        function onPreset(type) {
            pauseSimulation();
            generatePresetArray(type, arraySize.value);
            runAlgorithm();
            renderStep(0);
        }

        function onCustomArray() {
            applyCustomArray();
        }

        function onTargetPresent() {
            if (initialValues.value.length > 0) {
                const randItem = initialValues.value[Math.floor(Math.random() * initialValues.value.length)];
                searchTarget.value = randItem.val;
                pauseSimulation();
                runAlgorithm();
                renderStep(0);
            }
        }

        function onTargetAbsent() {
            const vals = initialValues.value.map(x => x.val);
            const maxV = vals.length > 0 ? Math.max(...vals) : 40;
            searchTarget.value = maxV + 5;
            pauseSimulation();
            runAlgorithm();
            renderStep(0);
        }

        function onTargetChange(val) {
            searchTarget.value = parseInt(val) || 0;
            pauseSimulation();
            runAlgorithm();
            renderStep(0);
        }

        function getItemState(item, idx) {
            const step = currentStep.value;
            if (!step) return 'unsorted';
            if (isSearch.value) {
                if (step.foundIndex === idx) return 'found';
                if (step.eliminatedIndices && step.eliminatedIndices.includes(idx)) return 'eliminated';
                if (step.activeIndices && step.activeIndices.includes(idx)) return 'active';
                return 'unsorted';
            } else {
                if (step.actionIndices && step.actionIndices.includes(idx)) return 'action';
                if (step.selectionMinIndex === idx) return 'selection-min';
                if (step.activeIndices && step.activeIndices.includes(idx)) return 'active';
                if (step.sortedIndices && step.sortedIndices.includes(idx)) return 'sorted';
                return 'unsorted';
            }
        }

        function getItemTooltip(item, idx) {
            const state = getItemState(item, idx);
            const labels = {
                found: '🎉 CIBLE TROUVÉE',
                eliminated: '❌ Éliminé (Hors intervalle)',
                active: isSearch.value ? '🔎 Inspecté par l\'algorithme' : '⚖️ En cours de Comparaison',
                action: '🔄 En cours de Permutation / Décalage',
                'selection-min': '👑 Minimum Provisoire actuel',
                sorted: '✅ Trié définitif',
                unsorted: isSearch.value ? 'Zone active de recherche' : 'Non trié'
            };
            return `Index [${idx}] | Valeur : ${item.val} | ${labels[state] || 'Non trié'}`;
        }

        function getItemHeight(item) {
            return Math.max(24, Math.floor((item.val / maxVal.value) * CONTAINER_MAX_HEIGHT));
        }

        function getItemLeft(idx) {
            return idx * (ITEM_WIDTH + ITEM_GAP);
        }

        function getPointerX(idx) {
            const arena = document.getElementById('arena-box');
            if (!arena) return 0;
            const arenaWidth = arena.offsetWidth;
            const innerLeft = (arenaWidth - totalWidth.value) / 2;
            return innerLeft + idx * (ITEM_WIDTH + ITEM_GAP) + ITEM_WIDTH / 2;
        }

        function copyCode() {
            const codeText = algoData.value.code.join('\n');
            navigator.clipboard.writeText(codeText).then(() => {
                const btn = document.getElementById('btn-copy-code');
                if (btn) {
                    btn.textContent = '✅ Copié !';
                    setTimeout(() => { btn.textContent = '📋 Copier'; }, 2000);
                }
            });
        }

        function onSpeedChange(val) {
            speedLevel.value = parseInt(val);
            if (isPlaying.value) {
                pauseSimulation();
                startSimulation();
            }
        }

        function highlightSyntax(line) {
            if (!line) return '';
            let res = line;
            let comment = '';
            if (res.includes('//')) {
                let idx = res.indexOf('//');
                comment = `<span class="code-comment">${res.substring(idx)}</span>`;
                res = res.substring(0, idx);
            }
            
            const keywords = ['Fin', 'Pour', 'Faire', 'Si', 'Alors', 'Sinon', 'Tant Que', 'Répéter', "Jusqu'à", 'Retourner'];
            keywords.forEach(kw => {
                res = ' ' + res + ' ';
                res = res.split(' ' + kw + ' ').join(' <span class="code-kw">' + kw + '</span> ');
                res = res.substring(1, res.length - 1);
            });

            ['div', 'Vrai', 'Faux', 'et'].forEach(kw => {
                res = ' ' + res + ' ';
                res = res.split(' ' + kw + ' ').join(' <span class="code-kw2">' + kw + '</span> ');
                res = res.substring(1, res.length - 1);
            });

            res = res.replace(/Permuter/g, '<span class="code-func">Permuter</span>');
            res = res.replace(/←/g, '<span class="code-op">←</span>');
            res = res.replace(/T\[/g, '<span class="code-var">T</span><span class="code-bracket">[</span>');
            res = res.replace(/\]/g, '<span class="code-bracket">]</span>');

            res = res + comment;
            res = res.replace(/^( +)/, match => '&nbsp;'.repeat(match.length));
            return res;
        }

        // ---- Initialisation ----
        onMounted(() => {
            generateRandomArray(arraySize.value);
            runAlgorithm();
            renderStep(0);

            // Re-render on window resize
            window.addEventListener('resize', () => {
                // Force reactivity update via nextTick
                nextTick(() => {
                    // Just trigger a re-render of pointer positions
                });
            });
        });

        watch(currentStepIndex, () => {
            // Play tone when step changes (handled in renderStep)
        });

        // Expose refs for template
        return {
            // State
            currentMode, currentAlgo, searchTarget, soundEnabled, arraySize, speedLevel,
            customInput, currentStepIndex, isPlaying, simulationSteps,
            // Computed
            currentStep, currentArray, isSearch, algoData, totalWidth, maxVal,
            isSelectionAlgo, isInsertionAlgo, algoCategoryLabel, defaultCommentText,
            binaryPointerStyle, seqPointerStyle, selMinPointerStyle, selRunnerPointerStyle,
            tempItemLeft, tempItemHeight,
            // Methods
            switchMode, switchAlgo, onSizeChange, onRandom, onPreset,
            onCustomArray, onTargetPresent, onTargetAbsent, onTargetChange,
            getItemState, getItemTooltip, getItemHeight, getItemLeft, getPointerX,
            stepNext, stepPrev, goToStart, goToEnd, togglePlay,
            copyCode, onSpeedChange, highlightSyntax,
            // Constantes exposées pour le template
            ITEM_WIDTH, ITEM_GAP, CONTAINER_MAX_HEIGHT,
            // Méthodes pour les vues
            playTone, toggleSound,
            // État pour les indices
            generateRandomArray, runAlgorithm, renderStep, pauseSimulation
        };
    }
});

app.mount('#app');