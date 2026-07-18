const customePhoneNumber = (phoneNumber) => {
    if (!phoneNumber) return '';

    // Hapus semua karakter selain angka
    let cleanedNumber = phoneNumber.replace(/\D/g, '');

    // Jika nomor dimulai dengan "08", ubah menjadi "628"
    if (cleanedNumber.startsWith('08')) {
        cleanedNumber = '628' + cleanedNumber.slice(2);
    }

    // Jika sudah dimulai dengan "62", biarkan
    else if (!cleanedNumber.startsWith('62')) {
        cleanedNumber = '62' + cleanedNumber; 
    }

    return cleanedNumber;
};

module.exports = { 
    customePhoneNumber,
}