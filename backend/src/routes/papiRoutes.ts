import { Router } from "express";
import * as PapiController from "../controllers/PapiController";

const papiRoutes = Router();

papiRoutes.post("/papi/webhook/:instanceId", PapiController.webhook);

export default papiRoutes;
