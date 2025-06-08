import * as openpgp from 'openpgp';

export default async function signCommitData(
  dataToSign: string,
  signingKey: string,
  passphrase?: string, // Added passphrase parameter
): Promise<string> {
  const promiseForDecryptedPrivateKey: Promise<openpgp.PrivateKey> = openpgp
    .readPrivateKey({ armoredKey: signingKey })
    .then(async keyObject => {
      // Ensure it's a PrivateKey object.
      if (!keyObject.isPrivate()) {
        return Promise.reject(
          new Error('The provided GPG key is not a private key.'),
        );
      }

      const privateKey = keyObject as openpgp.PrivateKey;

      if (privateKey.isDecrypted()) {
        return Promise.resolve(privateKey); // Already decrypted, use as is
      }

      // If not decrypted, a passphrase is required
      if (!passphrase) {
        return Promise.reject(
          new Error(
            'The GPG private key is encrypted, but no passphrase was provided.',
          ),
        );
      }

      // Attempt to decrypt
      try {
        return await openpgp.decryptKey({
          privateKey, // This is the encrypted PrivateKey object
          passphrase,
        });
      } catch (err: any) {
        return await Promise.reject(
          new Error(`Failed to decrypt GPG private key: ${err.message}`),
        );
      }
    });

  const promiseForUnsignedMessage: Promise<openpgp.CleartextMessage> =
    openpgp.createMessage({ text: dataToSign });

  return Promise.all([
    promiseForDecryptedPrivateKey,
    promiseForUnsignedMessage,
  ]).then(([decryptedPrivateKey, unsignedMessage]) => {
    return openpgp.sign({
      message: unsignedMessage,
      signingKeys: decryptedPrivateKey,
      detached: true,
    });
  });
}
