const http = require('node:http');

const data = {
    students: [],
    teachers: [],
    attendance: [],
    marks: []
};

const server = http.createServer(async (req, res) => {
    const url = new URL(req.url, 'http://localhost');
    const parts = url.pathname.split('/').filter(Boolean);

    const reply = (status, body) => {
        res.writeHead(status, {
            'Content-Type': 'application/json; charset=utf-8'
        });
        res.end(JSON.stringify(body));
    };

    if (parts.length === 0) {
        return reply(200, {
            message: 'Student Management System API',
            modules: Object.keys(data)
        });
    }

    const moduleName = parts[0];
    const id = parts[1];

    if (!Object.hasOwn(data, moduleName)) {
        return reply(404, { error: 'Module not found' });
    }

    let body = {};

    if (['POST', 'PUT', 'PATCH'].includes(req.method)) {
        try {
            let raw = '';

            for await (const chunk of req) {
                raw += chunk;
            }

            body = JSON.parse(raw);
        } catch {
            return reply(400, { error: 'Invalid JSON body' });
        }
    }

    const records = data[moduleName];

    if (req.method === 'GET' && !id) {
        return reply(200, records);
    }

    if (req.method === 'GET' && id) {
        const record = records.find(item => String(item.id) === id);

        if (!record) {
            return reply(404, { error: 'Record not found' });
        }

        return reply(200, record);
    }

    if (req.method === 'POST' && !id) {
        if (!Object.keys(body).length) {
            return reply(400, { error: 'Record data is required' });
        }

        const record = {
            id: records.length
                ? Math.max(...records.map(item => item.id)) + 1
                : 1,
            ...body
        };

        records.push(record);

        return reply(201, {
            message: 'Record created successfully',
            record
        });
    }

    if (req.method === 'PUT' && id) {
        const index = records.findIndex(
            item => String(item.id) === id
        );

        if (index === -1) {
            return reply(404, { error: 'Record not found' });
        }

        records[index] = {
            ...records[index],
            ...body,
            id: records[index].id
        };

        return reply(200, {
            message: 'Record updated successfully',
            record: records[index]
        });
    }

    if (req.method === 'DELETE' && id) {
        const index = records.findIndex(
            item => String(item.id) === id
        );

        if (index === -1) {
            return reply(404, { error: 'Record not found' });
        }

        const deleted = records.splice(index, 1)[0];

        return reply(200, {
            message: 'Record deleted successfully',
            record: deleted
        });
    }

    return reply(405, {
        error: 'Method not allowed for this route'
    });
});

server.listen(3002, () => {
    console.log('Student Management API running at http://localhost:3002');
});