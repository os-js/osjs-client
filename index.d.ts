export as namespace osjs__client;

// Internal types

export type WindowPositionString = 'center' | 'left' | 'right' | 'bottom' | 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right'
export type VFSFile = FileMetadata | string;
export type VFSFileData = Blob | ArrayBuffer | File | string;

// Internal interfaces

export interface UserProfile {
  id?: number;
  username: string;
  groups: string[];
}

// FIXME
export interface CoreConfig {
  development: boolean;
  standalone: boolean;
  http: object;
  ws: object;
  languages: Map<string, string>;
  packages: object;
  application: object;
  auth: object;
  settings: object;
  search: object;
  notifications: object;
  desktop: object;
  locale: object;
  windows: object;
  vfs: object;
  providers: object;
}

export interface CoreOptions {
  root?: Element
  resourceRoot?: Element
  classNames?: string[]
}

export interface ApplicationOptions {
  settings?: object;
  restore?: object;
  windowAutoFocus: boolean;
  sessionable: boolean;
}

export interface ApplicationData {
  args?: Map<string, any>;
  options?: ApplicationOptions;
  metadata?: PackageMetadata;
}

export interface ApplicationSessionData {
  args: Map<string, any>;
  name: string;
  windows: WindowSessionData[];
}

export interface WindowOptions {
  id?: string;
  title?: string;
  parent?: Window;
  template?: string | Function;
  attributes?: WindowAttributes;
  position?: WindowPosition | WindowPositionString;
  dimension?: WindowDimension;
  state?: WindowState;
}

export interface WindowDimension {
  width: number;
  height: number;
}

export interface WindowPosition {
  top: number;
  left: number;
}

export interface WindowState {
  title: string;
  icon: string;
  moving: boolean;
  resizing: boolean;
  loading: boolean;
  focused: boolean;
  maximized: boolean;
  minimized: boolean;
  modal: boolean;
  zIndex: number;
  position: WindowPosition;
  dimension: WindowDimension;
}

export interface WindowAttributes {
  classNames: string[];
  ontop: boolean;
  gravity: string;
  resizable: boolean;
  focusable: boolean;
  maximizable: boolean;
  minimizable: boolean;
  moveable: boolean;
  closeable: boolean;
  header: boolean;
  controls: boolean;
  visibility: string;
  clamp: boolean;
  minDimension: WindowDimension;
  maxDimension: WindowDimension;
  mediaQueries: Map<string, string>;
}

export interface WindowSessionData {
  id: string;
  position: WindowPosition;
  dimension: WindowDimension;
}

export interface DesktopContextMenu {

}

export interface DesktopOptions {
  contextmenu: DesktopContextMenu[] | Function;
}

export interface DesktopRect {
  width: number;
  height: number;
  top: number;
  bottom: number;
  left: number;
  right: number;
}

export interface PackageReference {
  metadata: PackageMetadata;
  callback: Function;
}

export interface PackageMetadata {
  name: string;
  category: string;
  icon: string;
  singleton: boolean;
  autostart: boolean;
  hidden: boolean;
  server: string;
  groups: string[];
  files: string[];
  title: Map<string, string>;
  description: Map<string, string>;
}

export interface FileMetadata {
  filename: string;
  path: string;
  mime?: string;
  type: string;
  size: number;
  isDirectory: boolean;
  isFile: boolean;
  stat?: object;
}

export interface PackageLaunchOptions {
  forcePreload: boolean;
}

export interface WebsocketOptions {
  interval: number;
  open: boolean;
}

export interface AuthOptions {
  ui: object;
  adapter(): AuthAdapter;
  login: Function;
  config: object;
}

export interface SettingsOptions {
  adapter(): SettingsAdapter;
}

export interface AuthAdapter {
  login(): Promise<UserProfile>;
  logout(): Promise<boolean>;
  init(): Promise<boolean>;
  destroy(): void;
}

export interface SettingsAdapter {
  load(): Promise<object>;
  save(): Promise<boolean>;
  init(): Promise<boolean>;
  clear(): Promise<boolean>;
  destroy(): void;
}

export interface ServiceProviderOptions {
  before?: boolean;
  depends?: string[];
  args?: object;
}

export interface FilesystemAdapter extends VFSMethods {
  mount(options?: object): Promise<boolean>;
  unmount(options?: object): Promise<boolean>;
}

export interface MountpointAttributes {
  visibility: string;
  local: boolean;
  searchable: boolean;
  readOnly: boolean;
}

export interface Mountpoint {
  name: string;
  label: string;
  adapter: string;
  enabled: boolean;
  attributes: MountpointAttributes;
}

export interface MountpointOptions extends Mountpoint {
  /* blank */
}

export interface FilesystemOptions {
  adapters: Map<string, FilesystemAdapter>;
  mounts: Mountpoint[];
}

export interface LoginOptions {
  id: string;
  title: string;
  stamp?: string;
  logo: object;
  fields: object;
}

export interface NotificationOptions {
  icon: string | null;
  title: string;
  message: string;
  timeout: number;
  native: boolean;
  sound?: string;
}

export interface TrayEntryOptions {
  icon: string;
  title: string;
  onclick: Function;
  oncontextmenu: Function;
  handler?: Function;
}

export interface TrayEntry {
  entry: TrayEntryOptions;
  update(data: object): void;
  destroy(): void;
}

export class EventEmitter {
  constructor(name?: string);
  on(event: string | string[], callback: Function): this;
  once(event: string | string[], callback: Function): this;
  off(event: string | string[], callback?: Function): this;
  emit(event: string | string[], callback: Function): this;
}

export class ServiceProvider {
  constructor(core: Core, options: object);
  destroy(): void;
  depends(): string[];
  provides(): string[];
  init(): Promise<any>;
  start(): void;
}

export interface VFSMethods {
  readdir(path: FileMetadata, options?: object): Promise<FileMetadata[]>;
  readfile(path: FileMetadata, options?: object): Promise<VFSFileData>;
  writefile(path: FileMetadata, data: VFSFileData, options?: object): Promise<number>;
  copy(from: FileMetadata, to: FileMetadata, options?: object): Promise<boolean>;
  rename(from: FileMetadata, to: FileMetadata, options?: object): Promise<boolean>;
  mkdir(path: FileMetadata, options?: object): Promise<boolean>;
  unlink(path: FileMetadata, options?: object): Promise<boolean>;
  exists(path: FileMetadata, options?: object): Promise<boolean>;
  touch(path: FileMetadata, options?: object): Promise<boolean>;
  stat(path: FileMetadata, options?: object): Promise<FileMetadata>;
  search(root: FileMetadata, pattern: string, options?: object): Promise<FileMetadata[]>;
  url(path: FileMetadata, options?: object): Promise<string>;
}

export interface VFS extends VFSMethods {
  download(path: FileMetadata, options?: object): Promise<any>;
}

// Utils

export class Preloader {
  loaded: string[];
  $root: Element;

  constructor(root: Element);
  destroy(): void;
  load(list: string[], force?: boolean): Promise<string[]>;
}

// Core

export class Tray {
  core: Core;
  entries: TrayEntry[];

  constructor(core: Core);
  destroy(): void;
  create(options: TrayEntryOptions, handler?: Function): void;
  remove(entry: TrayEntry): void;
}

export class Desktop extends EventEmitter {
  core: Core;
  options: DesktopOptions;
  $theme: Element[];
  $icons: Element[];
  $styles: Element;
  contextMenuEntries: DesktopContextMenu[];
  search?: Search;
  subtract: Map<string, number>;

  constructor(core: Core, options: DesktopOptions);
  destroy(): void;
  init(): void;
  start(): void;
  initConnectionEvents(): void;
  initUIEvents(): void;
  initDragEvents(): void;
  initKeyboardEvents(): void;
  initMouseEvents(): void;
  initBaseEvents(): void;
  initLocales(): void;
  initDeveloperTray(): void;
  addContextMenu(entries: DesktopContextMenu[]): void;
  applySettings(settings: object): object;
  applyIcons(name: string): Promise<any>;
  applyTheme(name: string): Promise<any>;
  onDeveloperMenu(ev: Event): void;
  onContextMenu(ev: Event): void;
  getRect(): DesktopRect;
}

export class Clipboard {
  constructor();
  destroy(): void;
  clear(): void;
  set(v: any): void;
  get(clear?: boolean): Promise<any>;
}

export class Splash {
  core: Core;
  $loading: Element;

  constructor(core: Core);
  destroy(): void;
  show(): void;
}

export class Search {
  core: Core;
  ui: EventEmitter;
  focusLastWindow?: Window;
  $element: Element;

  constructor(core: Core);
  destroy(): void;
  init(): void;
  search(pattern: string): FileMetadata[];
  focus(): void;
  hide(): void;
  show(): void;
}

export class Auth {
  core: Core;
  callback: Function;
  adapter: AuthAdapter;

  constructor(core: Core, args: AuthOptions);
  init(): Promise<boolean>;
  destroy(): void;
  shutdown(reload?: boolean): void;
  show(cb: Function): Promise<boolean>;
  login(values: object): Promise<boolean>;
  logout(reload?: boolean): Promise<boolean>;
}

export class Session {
  core: Core;

  constructor(core: Core);
  destroy(): void;
  save(): Promise<boolean>;
  load(fresh?: boolean): Promise<boolean>;
}

export class Settings {
  core: Core;
  adapter: SettingsAdapter;
  debounce: any;
  settings: Map<string, any>;

  constructor(core: Core, args: SettingsOptions);
  destroy(): void;
  init(): Promise<boolean>;
  save(): Promise<boolean>;
  load(): Promise<boolean>;
  get(ns: string, key: string, defaultValue?: any): any;
  set(ns: string, key?: string, value?: any): this;
  clear(ns: string): Promise<boolean>;
}

export class Filesystem extends EventEmitter {
  core: Core;
  adapters: Map<string, FilesystemAdapter>;
  mounts: Mountpoint[];
  options: FilesystemOptions;
  proxy: Map<string, Function>;

  constructor(core: Core, options: FilesystemOptions);
  destroy(): void;
  mountAll(stopOnError?: boolean): Promise<boolean>;
  mount(name: string): Promise<boolean>;
  unmount(name: string): Promise<boolean>;
  request(): Map<string, Function>;
  createMountpoint(props: MountpointOptions): void;
  getMountpointFromPath(file: FileMetadata | string): Mountpoint | null;
  getMounts(all?: boolean): Mountpoint[];
}


export class Login extends EventEmitter {
  core: Core;
  $container: Element;
  options: LoginOptions;

  constructor(core: Core, options: LoginOptions);
  destroy(): void;
  init(startHidden?: boolean): void;
  render(startHidden?: boolean): void;
}

export class Notification {
  core: Core;
  $root: Element;
  $element: Element;
  destroyed: false;
  options: NotificationOptions;

  constructor(core: Core, root: Element, options: NotificationOptions);
  destroy(): void;
  render(): void;
}

export class Notifications {
  core: Core;
  $element: Element;

  constructor(core: Core);
  destroy(): void;
  init(): void;
  create(options: NotificationOptions): Notification;
}

export class Packages {
  core: Core;
  packages: PackageReference[];
  metadata: PackageMetadata[];
  running: string[];
  preloader: Preloader;
  inited: boolean;

  constructor(core: Core);
  destroy(): void;
  init(): Promise<boolean>;
  launch(name: string, args?: object, options?: PackageLaunchOptions): Promise<Application>; // FIXME
  register(name: string, callback: Function): void;
  addPackages(list: PackageMetadata[]): PackageMetadata[];
  getPackages(filter?: Function): PackageMetadata[];
  getCompatiblePackages(mimeType: string): PackageMetadata[];
}

export class Websocket extends EventEmitter {
  constructor(name: string, uri: string, options: WebsocketOptions);
  open(reconnect?: boolean): void;
  send(...args: any): void;
  close(): void;
}

export class Application extends EventEmitter {
  pid: number;
  core: Core;
  args: Map<string, any>;
  options: ApplicationOptions;
  metadata: PackageMetadata;
  settings: Map<string, any>;
  windows: Window[];
  workers: Worker[];
  sockets: Websocket[];
  requestOptions: Map<string, any>;
  destroyed: boolean;
  started: Date;

  constructor(core: Core, data: ApplicationData);
  destroy(remove?: boolean): void;
  relaunch(): void;
  resource(path?: string, options?: object): string;
  request(path?: string, options?: object, type?: string): Promise<any>;
  socket(path?: string, options?: object): Websocket;
  worker(filename: string, options?: object): Worker;
  send(...args: any): void;
  createWindow(options?: WindowOptions): Window;
  removeWindow(filter?: Function): void;
  getSession(): ApplicationSessionData;
  saveSettings(): Promise<boolean>;

  static getApplications(): Application[];
  static destroyAll(): void;
}

export class Window extends EventEmitter {
  id: string;
  wid: number;
  parent?: Window;
  children: Window[];
  core: Core;
  destroyed: boolean;
  rendered: boolean;
  attributes: WindowAttributes;
  state: WindowState;
  $element: Element;
  $content: Element;
  $header: Element;
  $icon: Element;
  $title: Element;

  constructor(core: Core, options?: WindowOptions);
  destroy(): void;
  init(): this;
  render(callback?: Function): this;
  close(): this;
  focus(): this;
  blur(): this;
  minimize(): this;
  raise(): this;
  maximize(): this;
  restore(): this;
  resizeFit(container: Element): void;
  clampToViewport(update?: boolean): void;
  gravitate(gravity: string): void;
  setIcon(uri: string): void;
  setTitle(title: string): void;
  setDimension(dimension: WindowDimension): void;
  setPosition(position: WindowPosition): void;
  setZindex(zindex: number): void;
  setState(name: string, value: any, update?: boolean): void;
  getState(name: string): any;
  getSession(): WindowSessionData | null;

  private _toggleState(name: string, value: any, eventName: string, update?: boolean): boolean;
  private _setState(name: string, value: any, update?: boolean): void;
  private _updateDOM(): void;

  static getWindows(): Window[];
  static lastWindow(): Window;
}

export class Core extends EventEmitter {
  ws: Websocket;
  user: UserProfile;
  options: CoreOptions;
  $root: Element;
  $resourceRoot: Element;

  constructor(config?: CoreConfig, options?: CoreOptions);
  destroy(): void;
  boot(): Promise<boolean>;
  start(): Promise<boolean>;
  config(key?: string, defaultValue?: any): any;
  register(ref: ServiceProvider, options?: ServiceProviderOptions): void;
  instance(name: string, callback: Function): void;
  singleton(name: string, callback: Function): void;
  make(name: string, ...args: any): any; // FIXME
  has(name: string): boolean;

  url(endpoint?: string, options?: object, metadata?: object): string;
  request(url: string, options?: object, type?: string): Promise<any>;
  run(name: string, args?: object, options?: object): Promise<Application>;
  open(file: VFSFile,  options?: object): Promise<Application>;
  broadcast(pkg: string | Function, name: string, ...args: any): string[];
  setRequestOptions(options: object): void;
  getUser(): UserProfile;
}

// Service Provider Contracts

export interface AuthServiceContract {
  show(cb: Function): Promise<boolean>;
  login(values: object): Promise<boolean>;
  logout(reload?: boolean): Promise<boolean>;
  user(): UserProfile;
}

export interface DesktopServiceContract {
  addContextMenuEntries(entries: DesktopContextMenu[]): void;
  applySettings(settings: object): object;
  getRect(): DesktopRect;
}

export interface SettingsServiceContract {
  save(): Promise<boolean>;
  load(): Promise<boolean>;
  get(ns: string, key: string, defaultValue?: any): any;
  set(ns: string, key?: string, value?: any): this;
  clear(ns: string): Promise<boolean>;
}

export interface VFSServiceContract extends VFSMethods {}

export interface FilesystemServiceContract {
  pathJoin(...args: string[]): string;
  icon(name: string): string;
  mountpoints(all?: boolean): Mountpoint[];
  mount(name: string): Promise<boolean>;
  unmount(name: string): Promise<boolean>;
}

export interface WindowsServiceContract {
  create(options: WindowOptions): Window;
  list(): Window[];
  last(): Window;
}

export interface SessionServiceContract {
  save(): Promise<boolean>;
  load(): Promise<boolean>;
}

export interface LocaleServiceContract {
  format(): string;
  translate(): string;
  translatable(): Function;
  translatableFlat(): Function;
  getLocale(): string;
  setLocale(name: string): Promise<any>;
}

export interface PackagesServiceContract {
  running(): string[];
  launch(name: string, args?: object, options?: PackageLaunchOptions): Promise<Application>; // FIXME
  register(name: string, callback: Function): void;
  getPackages(filter?: Function): PackageMetadata[];
  getCompatiblePackages(mimeType: string): PackageMetadata[];
}

export interface ClipboardServiceContract {
  clear(): void;
  set(v: any): void;
  get(clear?: boolean): Promise<any>;
}

export interface ThemeServiceContract {
  resource(name: string): string;
  icon(name: string): string;
}

export interface SoundServiceContract {
  resource(name: string): string;
  play(src: string): Promise<boolean>;
}
