import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { ButtonModule } from 'primeng/button';
import { CardModule } from 'primeng/card';
import { DialogModule } from 'primeng/dialog';
import { InputTextModule } from 'primeng/inputtext';
import { InputNumberModule } from 'primeng/inputnumber';
import { InputTextarea } from 'primeng/inputtextarea';
import { ToastModule } from 'primeng/toast';
import { TagModule } from 'primeng/tag';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { MessageService, ConfirmationService } from 'primeng/api';

import { RecipeService } from '../../core/services/recipe.service';
import { AuthService } from '../../core/services/auth.service';
import { Recipe, RecipeInput } from '../../core/models/recipe.model';
import { extractErrorMessage } from '../../core/utils/error.util';

const EMPTY_FORM: RecipeInput = {
  title: '',
  description: '',
  ingredients: '',
  steps: '',
  servings: undefined,
  prep_time_minutes: undefined,
  category: '',
};

@Component({
  selector: 'app-recipe-list',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ButtonModule,
    CardModule,
    DialogModule,
    InputTextModule,
    InputNumberModule,
    InputTextarea,
    ToastModule,
    TagModule,
    ConfirmDialogModule,
  ],
  providers: [MessageService, ConfirmationService],
  templateUrl: './recipe-list.component.html',
})
export class RecipeListComponent implements OnInit {
  recipes: Recipe[] = [];
  loading = false;
  showInactive = false;

  dialogVisible = false;
  editingId: string | null = null;
  form: RecipeInput = { ...EMPTY_FORM };
  saving = false;

  constructor(
    private recipeService: RecipeService,
    private authService: AuthService,
    private router: Router,
    private messageService: MessageService,
    private confirmationService: ConfirmationService
  ) {}

  ngOnInit(): void {
    // Al iniciar sesión se cargan las recetas de todos los usuarios
    this.loadRecipes();
  }

  loadRecipes(): void {
    this.loading = true;
    this.recipeService.list(this.showInactive).subscribe({
      next: (recipes) => {
        this.recipes = recipes;
        this.loading = false;
      },
      error: () => {
        this.loading = false;
        this.messageService.add({ severity: 'error', summary: 'Error', detail: 'No se pudieron cargar las recetas' });
      },
    });
  }

  toggleShowInactive(): void {
    this.showInactive = !this.showInactive;
    this.loadRecipes();
  }

  openCreateDialog(): void {
    this.editingId = null;
    this.form = { ...EMPTY_FORM };
    this.dialogVisible = true;
  }

  openEditDialog(recipe: Recipe): void {
    this.editingId = recipe.id;
    this.form = {
      title: recipe.title,
      description: recipe.description ?? '',
      ingredients: recipe.ingredients,
      steps: recipe.steps,
      servings: recipe.servings,
      prep_time_minutes: recipe.prep_time_minutes,
      category: recipe.category ?? '',
    };
    this.dialogVisible = true;
  }

  saveRecipe(): void {
    this.saving = true;
    const request$ = this.editingId
      ? this.recipeService.update(this.editingId, this.form)
      : this.recipeService.create(this.form);

    request$.subscribe({
      next: () => {
        this.saving = false;
        this.dialogVisible = false;
        this.messageService.add({
          severity: 'success',
          summary: 'Listo',
          detail: this.editingId ? 'Receta actualizada' : 'Receta creada',
        });
        this.loadRecipes();
      },
      error: (err) => {
        this.saving = false;
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: extractErrorMessage(err, 'No se pudo guardar la receta'),
        });
      },
    });
  }

  confirmDeactivate(recipe: Recipe): void {
    this.confirmationService.confirm({
      message: `¿Dar de baja la receta "${recipe.title}"? Podrás reactivarla después.`,
      header: 'Confirmar baja',
      icon: 'pi pi-exclamation-triangle',
      acceptLabel: 'Sí, dar de baja',
      rejectLabel: 'Cancelar',
      accept: () => this.deactivate(recipe),
    });
  }

  deactivate(recipe: Recipe): void {
    this.recipeService.deactivate(recipe.id).subscribe({
      next: () => {
        this.messageService.add({ severity: 'info', summary: 'Receta dada de baja', detail: recipe.title });
        this.loadRecipes();
      },
      error: () => {
        this.messageService.add({ severity: 'error', summary: 'Error', detail: 'No se pudo dar de baja la receta' });
      },
    });
  }

  reactivate(recipe: Recipe): void {
    this.recipeService.reactivate(recipe.id).subscribe({
      next: () => {
        this.messageService.add({ severity: 'success', summary: 'Receta reactivada', detail: recipe.title });
        this.loadRecipes();
      },
      error: () => {
        this.messageService.add({ severity: 'error', summary: 'Error', detail: 'No se pudo reactivar la receta' });
      },
    });
  }

  logout(): void {
    this.authService.logout();
    this.router.navigate(['/login']);
  }
}
