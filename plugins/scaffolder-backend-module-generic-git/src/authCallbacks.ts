import Nodegit from 'nodegit';

export default function getAuthCallbacks(
  username: string,
  publickey: string,
  privatekey: string,
  passphrase: string,
): Nodegit.RemoteCallbacks {
  return {
    credentials: () => {
      return Nodegit.Credential.sshKeyMemoryNew(
        username,
        publickey,
        privatekey,
        passphrase,
      );
    },
  };
}
