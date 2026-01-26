import { Router } from 'express';
import { templateController } from '../controllers/template.controller';

const router = Router();

// Template routes are public (no auth required for viewing templates)
router.get('/', templateController.getAllTemplates.bind(templateController));
router.get('/:id', templateController.getTemplateById.bind(templateController));

export default router;
