import * as openpgp from 'openpgp';

export default async function signCommitData(
  dataToSign: string,
  signingKey: string,
  passphrase?: string,
): Promise<string> {
  const promiseForDecryptedPrivateKey: Promise<openpgp.PrivateKey> = openpgp
    .readPrivateKey({ armoredKey: signingKey })
    .then(armoredPrivateKey => {
      return openpgp.decryptKey({
        privateKey: armoredPrivateKey,
        passphrase,
      });
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
