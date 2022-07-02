const belumSelesai = [];
const RENDER_EVENT = 'render-buku';
const SAVED_EVENT = 'saved-buku';
const STORAGE_KEY = 'BOOK_APPS';

// OnLoad Sweet Alert
function welcome() {
    Swal.fire('SELAMAT DATANG DI BOOKAPPS!');
}

// Cek Mendukung Local Storage / Tidak

function isStorageExist() {
    if (typeof(Storage) === undefined) {
        alert('Browser Tidak Mendukung Local Storage');
        return false;
    }

    return true;
}

// Mengambil Data Dari LocalStorage dan Ditampilkan

function loadDataFromStorage() {
    const serializedData = localStorage.getItem(STORAGE_KEY);
    let data = JSON.parse(serializedData);

    if (data !== null) {
        for (const buku of data) {
            belumSelesai.push(buku);
        }
    }

    document.dispatchEvent(new Event(RENDER_EVENT));
}

document.addEventListener(SAVED_EVENT, function() {
    console.log(localStorage.getItem(STORAGE_KEY));
});

// Menambahkan Data Buku
document.addEventListener('DOMContentLoaded', function() {

    const submitForm = document.getElementById('form');
    submitForm.addEventListener('submit', function(event) {
        event.preventDefault();
        addBuku();
    });

    if (isStorageExist()) {
        loadDataFromStorage();
    }
});

document.addEventListener(RENDER_EVENT, function() {
    // console.log(belumSelesai);
    const belumSelesaiDibaca = document.getElementById('belumSelesai');
    belumSelesaiDibaca.innerHTML = '';

    const sudahSelesaiDibaca = document.getElementById('sudahSelesai');
    sudahSelesaiDibaca.innerHTML = '';

    for (const bukuItem of belumSelesai) {
        const bukuElement = buatBuku(bukuItem);
        if (!bukuItem.isCompleted)
            belumSelesaiDibaca.append(bukuElement);
        else
            sudahSelesaiDibaca.append(bukuElement);
    }
});

function addBuku() {

    const jenisBuku = document.getElementById('jenisBuku').value;
    const namaBuku = document.getElementById('namaBuku').value;
    const penerbitBuku = document.getElementById('penerbitBuku').value;
    const idBuku = document.getElementById('idBuku').value;

    const generatedID = generateId();
    const bukuObject = generateBukuObject(generatedID, jenisBuku, namaBuku, penerbitBuku, idBuku, false)
    belumSelesai.push(bukuObject);

    document.dispatchEvent(new Event(RENDER_EVENT));
    saveData();
}

function generateId() {
    return +new Date();
}

function generateBukuObject(id, jenisBuku, namaBuku, penerbitBuku, idBuku, isCompleted) {

    return {
        id,
        jenisBuku,
        namaBuku,
        penerbitBuku,
        idBuku,
        isCompleted
    }
}

// Sweet Alert
const submit = document.getElementById('submit');
submit.addEventListener('click', function() {
    Swal.fire("Berhasil!", "Data Berhasil Dimasukkan!", "success");
});


// Mencari dan Memindah Buku ke Belum Selesai Dibaca

function addTaskToCompleted(bukuId) {
    const targetBuku = cariBuku(bukuId);

    if (targetBuku == null) return;

    targetBuku.isCompleted = true;
    document.dispatchEvent(new Event(RENDER_EVENT));
    saveData();
}

function cariBuku(bukuId) {
    for (const bukuItem of belumSelesai) {
        if (bukuItem.id === bukuId) {
            return bukuItem;
        }
    }

    return null;
}

// Menampilkan Data Buku

function buatBuku(bukuObject) {

    const textJenisBuku = document.createElement('h2');
    textJenisBuku.innerText = bukuObject.jenisBuku;

    const textNamaBuku = document.createElement('p');
    textNamaBuku.innerText = bukuObject.namaBuku;

    const textPenerbitBuku = document.createElement('p');
    textPenerbitBuku.innerText = bukuObject.penerbitBuku;

    const textIdBuku = document.createElement('p');
    textIdBuku.innerText = bukuObject.idBuku;

    const textContainer = document.createElement('div');
    textContainer.classList.add('inner');
    textContainer.append(textJenisBuku, textNamaBuku, textPenerbitBuku, textIdBuku);

    const container = document.createElement('div');
    container.classList.add('item', 'shadow');
    container.append(textContainer);
    container.setAttribute('id', `buku-${bukuObject.id}`)

    // Membuat Element

    if (bukuObject.isCompleted) {

        const undoButton = document.createElement('button');
        undoButton.classList.add('undo-button');

        undoButton.addEventListener('click', function() {
            Swal.fire('Data Berhasil Dikembalikan');
            undoTaskForCompleted(bukuObject.id);
        });

        const trashButton = document.createElement('button');
        trashButton.classList.add('trash-button');
        trashButton.setAttribute('id', 'trashButton');

        trashButton.addEventListener('click', function() {
            Swal.fire({
                title: 'Anda Yakin Ingin Menghapus Data?',
                showDenyButton: false,
                showCancelButton: true,
                confirmButtonText: 'Hapus',
                cancelButtonText: `Batal`,
            }).then((result) => {
                /* Read more about isConfirmed, isDenied below */
                if (result.isConfirmed) {
                    Swal.fire('Dihapus!', 'Data Anda Berhasil Dihapus!', 'success')
                    removeTaskFromCompleted(bukuObject.id);
                }
            })
        });

        container.append(undoButton, trashButton);
    } else {
        const checkButton = document.createElement('button');
        checkButton.classList.add('check-button');

        checkButton.addEventListener('click', function() {
            Swal.fire({
                title: 'Apakah Anda Yakin Ingin Memindah Data?',
                showDenyButton: true,
                showCancelButton: false,
                confirmButtonText: 'Pindah',
                denyButtonText: `Jangan Pindah`,
            }).then((result) => {
                /* Read more about isConfirmed, isDenied below */
                if (result.isConfirmed) {
                    Swal.fire('Dipindah!', 'Data Anda Berhasil Dipindah', 'success')
                    addTaskToCompleted(bukuObject.id);
                } else if (result.isDenied) {
                    Swal.fire('Gagal Dipindah!', 'Data Anda Gagal Dipindah!', 'info')
                }
            })
        });

        container.append(checkButton);
    }

    return container;
}

// Menghapus dan Undo Buku

function removeTaskFromCompleted(bukuId) {
    const targetBuku = cariIndexBuku(bukuId);

    if (targetBuku === -1) return;

    belumSelesai.splice(targetBuku, 1);
    document.dispatchEvent(new Event(RENDER_EVENT));
    saveData();
}

function undoTaskForCompleted(bukuId) {
    const targetBuku = cariBuku(bukuId);

    if (targetBuku == null) return;

    targetBuku.isCompleted = false;
    document.dispatchEvent(new Event(RENDER_EVENT));
    saveData();
}

function cariIndexBuku(bukuId) {
    for (const index in belumSelesai) {
        if (belumSelesai[index].id == bukuId) {
            return index;
        }
    }

    return -1;
}

// Menggunakan Local Storage Browser

function saveData() {
    if (isStorageExist()) {
        const parsed = JSON.stringify(belumSelesai);
        localStorage.setItem(STORAGE_KEY, parsed);
        document.dispatchEvent(new Event(SAVED_EVENT));
    }
}