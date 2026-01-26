import { PRESET_TEMPLATES } from '../constants/templates';
import { TargetTemplate, TargetPosition } from '../types';

class TemplateService {
  /**
   * Get all available preset templates
   */
  getAllTemplates(): TargetTemplate[] {
    return PRESET_TEMPLATES;
  }

  /**
   * Get a specific template by ID
   */
  getTemplateById(id: string): TargetTemplate | null {
    return PRESET_TEMPLATES.find((t) => t.id === id) || null;
  }

  /**
   * Get the target position for a specific shot number in a template
   * Uses cycling: shotNumber % positions.length
   * @param templateId - The template ID
   * @param shotNumber - The shot number (0-indexed)
   * @returns The target position or null if template not found
   */
  getTargetForShot(templateId: string, shotNumber: number): TargetPosition | null {
    const template = this.getTemplateById(templateId);
    if (!template || template.positions.length === 0) {
      return null;
    }

    const positionIndex = shotNumber % template.positions.length;
    return template.positions[positionIndex];
  }
}

export const templateService = new TemplateService();
