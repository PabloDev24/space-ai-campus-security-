import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { ThemeService } from '../../core/services/theme.service';
import { AppIcon, IconName } from '../../shared/ui/app-icon';
import { CasetaScene } from '../../shared/ui/caseta-scene';

interface Feature {
  index: string;
  icon: IconName;
  title: string;
  copy: string;
}

interface Step {
  index: string;
  title: string;
  copy: string;
}

@Component({
  selector: 'app-landing',
  imports: [RouterLink, AppIcon, CasetaScene],
  templateUrl: './landing.html',
  styleUrl: './landing.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Landing {
  readonly theme = inject(ThemeService);

  readonly features: Feature[] = [
    {
      index: '01',
      icon: 'scan',
      title: 'Validación en tiempo real',
      copy: 'El QR dinámico del estudiante se verifica contra SpaceIA: firma, vigencia, rol y estado de la cuenta.',
    },
    {
      index: '02',
      icon: 'history',
      title: 'Bitácora auditable',
      copy: 'Cada lectura queda asociada a la caseta y al guardia autenticado, sin edición manual posible.',
    },
    {
      index: '03',
      icon: 'chart',
      title: 'Concurrencia visible',
      copy: 'Descubre en un vistazo qué días y a qué horas se concentra el acceso al campus.',
    },
  ];

  readonly steps: Step[] = [
    {
      index: '1',
      title: 'El estudiante genera su QR',
      copy: 'Desde la app móvil SpaceIA, con vigencia corta y firma cifrada.',
    },
    {
      index: '2',
      title: 'La caseta lo escanea',
      copy: 'Este portal envía el token al backend; nunca lo interpreta por su cuenta.',
    },
    {
      index: '3',
      title: 'SpaceIA decide y registra',
      copy: 'Autorizado, duplicado o denegado, con la evidencia guardada en bitácora.',
    },
  ];
}
