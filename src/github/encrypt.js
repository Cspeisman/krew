import sodium from 'libsodium-wrappers';

export async function encrypt(secret, key) {
    await sodium.ready;
    // Convert the secret and key to a Uint8Array.
    let binkey = sodium.from_base64(key, sodium.base64_variants.ORIGINAL)
    let binsec = sodium.from_string(secret)

    // Encrypt the secret using libsodium
    let encBytes = sodium.crypto_box_seal(binsec, binkey)

    // Convert the encrypted Uint8Array to Base64
    return sodium.to_base64(encBytes, sodium.base64_variants.ORIGINAL);
}
