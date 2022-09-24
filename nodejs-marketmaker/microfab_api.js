const http = require('http')

http.get('http://console.127.0.0.1.nip.io:8081/ak/api/v1/components', response => {
            const chunks = [];
            response.on('data', chunk => chunks.push(chunk));
            response.on('end', () => {
                const data = chunks.join('');
                JSON.parse(data)
                    .filter(entry => entry.type === 'identity' )
                    .forEach(entry => {
                        const certificate = Buffer.from(entry.cert, 'base64').toString();
                        const privateKey = Buffer.from(entry.private_key, 'base64').toString();
                        const credentials = { certificate, privateKey };
                        console.log(`${entry.id}:`, credentials);
                    });
                 });
            }).on('error', console.error);