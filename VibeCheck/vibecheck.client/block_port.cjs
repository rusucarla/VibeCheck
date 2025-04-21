const net = require('net');
const port = 54894;

const _server = net.createServer().listen(port, () => {
    console.log(`Port ${port} is now occupied for testing.`);
});
