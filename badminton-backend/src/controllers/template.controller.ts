import { Request, Response } from 'express';
import { templateService } from '../services/template.service';

export class TemplateController {
  /**
   * GET /api/templates
   * List all preset templates
   */
  async getAllTemplates(req: Request, res: Response) {
    try {
      const templates = templateService.getAllTemplates();
      res.status(200).json({ success: true, templates });
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Unknown error';
      res.status(500).json({ error: message });
    }
  }

  /**
   * GET /api/templates/:id
   * Get a specific template by ID
   */
  async getTemplateById(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const template = templateService.getTemplateById(id);

      if (!template) {
        return res.status(404).json({ error: 'Template not found' });
      }

      res.status(200).json({ success: true, template });
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Unknown error';
      res.status(500).json({ error: message });
    }
  }
}

export const templateController = new TemplateController();
