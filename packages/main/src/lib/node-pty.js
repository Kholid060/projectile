const os = require('os');
const pty = require('node-pty-prebuilt-multiarch');

const shell = os.platform() === 'win32' ? 'powershell.exe' : 'bash';

export default pty;
