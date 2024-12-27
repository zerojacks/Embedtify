import { Router, Request, Response } from 'express';
import { DeviceService } from '../services/device.service';
import { ConnectionManager } from '../managers/ConnectionManager';

const router = Router();
const deviceService = new DeviceService();
const connectionManager = new ConnectionManager();

router.get('/devices/all', async (req: Request, res: Response) => {
    const devices = await deviceService.getAllDevices();
    res.status(200).json(devices);
});

router.get('/devices/:id', async (req: Request, res: Response) => {
    const device = await deviceService.getDeviceById(req.params.id);
    res.status(200).json(device);
});

router.post('/devices/add', async (req: Request, res: Response) => {
    const device = await deviceService.createDevice(req.body);
    res.status(200).json(device);
});

router.put('/devices/update', async (req: Request, res: Response) => {
    const device = await deviceService.updateDevice(req.body);
    res.status(200).json(device);
});

router.delete('/devices/delete/:id', async (req: Request, res: Response) => {
    await deviceService.deleteDevice(req.params.id);
    res.status(200).send('Device deleted successfully.');
});

router.post('/devices/connect', async (req: Request, res: Response) => {
    try {
        console.log("connect", req.body);
        await connectionManager.addConnection(req.body.type, req.body.config);
        res.status(200).send('Connected successfully.');
    } catch (error: unknown) {
        const errorMessage = error instanceof Error ? error.message : 'Unknown error';
        res.status(500).send(`Connection failed: ${errorMessage}`);
    }
});

router.post('/devices/disconnect', async (req: Request, res: Response) => {
    try {
        await connectionManager.removeConnection(req.body.type);
        res.status(200).send('Disconnected successfully.');
    } catch (error: unknown) {
        const errorMessage = error instanceof Error ? error.message : 'Unknown error';
        res.status(500).send(`Disconnection failed: ${errorMessage}`);
    }
});

router.post('/devices/send', async (req: Request, res: Response) => {
    try {
        await connectionManager.send(req.body.type, Buffer.from(req.body.data));
        res.status(200).send('Data sent successfully.');
    } catch (error: unknown) {
        const errorMessage = error instanceof Error ? error.message : 'Unknown error';
        res.status(500).send(`Send failed: ${errorMessage}`);
    }
});

router.post('/devices/receive', async (req: Request, res: Response) => {
    try {
        const data = await connectionManager.receive(req.body.type);
        res.status(200).json({ data: data.toString() });
    } catch (error: unknown) {
        const errorMessage = error instanceof Error ? error.message : 'Unknown error';
        res.status(500).send(`Receive failed: ${errorMessage}`);
    }
});

router.post('/devices/sendAndReceive', async (req: Request, res: Response) => {
    try {
        const data = await connectionManager.sendAndReceive(req.body.type, req.body.data, parseInt(req.body.timeout));
        res.status(200).json({ data: data.toString() });
    } catch (error: unknown) {
        const errorMessage = error instanceof Error ? error.message : 'Unknown error';
        res.status(500).send(`Send and receive failed: ${errorMessage}`);
    }
});

export default router;
