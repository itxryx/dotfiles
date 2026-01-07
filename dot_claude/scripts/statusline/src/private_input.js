function getInput() {
    let input = '';
    const stdin = process.stdin;
    stdin.setEncoding('utf8');

    return new Promise((resolve) => {
        if (stdin.isTTY) {
            resolve('{}');
        } else {
            stdin.on('data', (chunk) => {
                input += chunk;
            });
            stdin.on('end', () => {
                resolve(input.trim() || '{}');
            });
            stdin.on('error', () => {
                resolve('{}');
            });
        }
    });
}

module.exports = { getInput };
