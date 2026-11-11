import express from 'express';
import {
  getFlavors,
  getFlavorById,
  createFlavor,
  updateFlavor,
  deleteFlavor,
} from '../controllers/flavorController.js';

const router = express.Router();

router.route('/')
  .get(getFlavors)
  .post(createFlavor);

router.route('/:id')
  .get(getFlavorById)
  .put(updateFlavor)
  .delete(deleteFlavor);

export default router;

