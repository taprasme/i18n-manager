import {
  Component, ElementRef,
  EventEmitter,
  Input,
  OnChanges,
  OnInit,
  Output,
  SimpleChanges, ViewChild
} from '@angular/core';
import * as _ from 'lodash';
import { ParsedFile } from '@common/types';


@Component({
  selector: 'app-tree',
  templateUrl: './tree.component.html',
  styleUrls: ['./tree.component.styl']
})
export class TreeComponent implements OnInit, OnChanges {

  @Input() tree: any;
  @Input() parentTree: any;
  @Input() label = '';
  @Input() level = 0;
  @Input() path: string[] = [];
  @Input() openedPath: string[] = [];
  @Input() folder: ParsedFile[];
  @Output() openPath = new EventEmitter<string[]>(true);
  @Output() contextMenu = new EventEmitter<any>(true);

  @Input() isAddingItem: boolean;
  @Input() addingItemData: any;
  @Output() cancelAddItem = new EventEmitter<void>(true);
  @Output() addItem = new EventEmitter<any>(true);
  addingItemName: string;
  @ViewChild('addItemInput') addItemInput: ElementRef;

  @Input() isRenamingItem: boolean;
  @Input() renamingItemData: any;
  renamingItemName: string;
  @ViewChild('renameItemInput') renameItemInput: ElementRef;
  @Output() cancelRenameItem = new EventEmitter<void>(true);
  @Output() renameItem = new EventEmitter<any>(true);

  isCollapsed = false;
  missingTranslations = 0;

  constructor() {
  }

  ngOnInit() {
    this.updateMissingTranslationsCounter();
    this.renamingItemName = this.label;
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes.isAddingItem && changes.isAddingItem.currentValue && this.isAddingItemPath()) {
      this.isCollapsed = false;

      // Delay needed because of the delay to input appear
      setTimeout(() => this.addItemInput.nativeElement.focus(), 100);
    }

    if (changes.isRenamingItem && changes.isRenamingItem.currentValue && this.isRenamingItemPath()) {
      this.isCollapsed = false;

      // Delay needed because of the delay to input appear
      setTimeout(() => this.renameItemInput.nativeElement.focus(), 100);
    }

    this.updateMissingTranslationsCounter();
  }

  get hasChildren() {
    return this.tree && typeof (this.tree) !== 'string';
  }

  get childrenKeys() {
    return this.hasChildren
      ? Object.keys(this.tree).sort((a, b) => a.localeCompare(b))
      : null;
  }

  toggleOrOpen() {
    if (this.hasChildren) {
      this.isCollapsed = !this.isCollapsed;
    } else {
      this.openPath.emit(this.path);
    }
  }

  onOpenPath(event: string[]) {
    this.openPath.emit(event);
  }

  onMouseUp(event: MouseEvent) {
    if (event.button === 2) {
      this.onContextMenu({
        path: this.path,
        x: event.pageX,
        y: event.pageY,
      });
    }
  }

  onContextMenu(event: any) {
    this.contextMenu.emit(event);
  }

  isAddingItemPath() {
    return this.isAddingItem && _.isEqual(this.path, this.addingItemData.path);
  }

  isRenamingItemPath() {
    return this.isRenamingItem && _.isEqual(this.path, this.renamingItemData.path);
  }

  onAddingItemNameChange(event: any) {
    this.addingItemName = event.target.value;
    if (event.key === 'Escape') {
      this.onCancelAddItem();
    }

    if (event.key !== 'Enter') {
      return;
    }

    if (this.addingItemName.trim().length === 0) {
      this.onCancelAddItem();
    } else {
      this.onAddItem({
        ...this.addingItemData,
        name: this.addingItemName,
      });

      this.addingItemName = '';
    }
  }

  onRenamingItemNameChange(event: any) {
    this.renamingItemName = event.target.value;
    if (event.key === 'Escape') {
      this.onCancelRenameItem();
    }

    if (event.key !== 'Enter') {
      return;
    }

    if (this.renamingItemName.trim().length === 0 || this.renamingItemName === this.label) {
      this.onCancelRenameItem();
    } else {
      this.onRenameItem({
        ...this.renamingItemData,
        name: this.renamingItemName,
      });

      this.renamingItemName = '';
    }
  }

  get isValidAddingItemName() {
    return this.tree && Object.keys(this.tree).indexOf(this.addingItemName) === -1;
  }

  get isValidRenamingItemName() {
    if (!this.isRenamingItemPath()) {
      return false;
    }
    return this.parentTree &&
      Object.keys(this.parentTree)
        .filter(it => it !== this.label)
        .indexOf(this.renamingItemName) === -1;
  }

  onCancelAddItem() {
    this.cancelAddItem.emit();
  }

  private onAddItem(data: any) {
    this.addItem.emit(data);
  }

  onCancelRenameItem() {
    this.cancelRenameItem.emit();
  }

  private onRenameItem(data: any) {
    this.renameItem.emit(data);
  }

  isOpenedPath() {
    return _.isEqual(this.path, this.openedPath);
  }

  private updateMissingTranslationsCounter() {
    if (this.hasChildren || !this.folder) {
      this.missingTranslations = 0;
      return;
    }

    this.missingTranslations = this.folder
      .map(it => _.get(it.data, this.path))
      .filter(it => !it)
      .length;
  }
}
