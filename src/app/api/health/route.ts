import { verificarSaude } from '../../../back/services/health.service';

export async function GET() {
  return Response.json(verificarSaude());
}