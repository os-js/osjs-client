# Changelog for osjs-client

## 3.1.9

* Added configuration option for window move keyboard shortcut (#81)

## 3.1.8

* Add missing Window 'resized' event signatures (#77)

## 3.1.7

* Use desktop contextmenu in iconview (#51)
* Ensure desktop iconview root contextmenu appears in correct context (#51)
* Make desktop iconview drop be shortcut by default (#51)
* Unselect desktop icons if root was clicked (#51)
* Added a contextmenu to desktop iconview (#51)
* Add application shortcut support to iconview (#51)
* Improved desktop iconview and added shortcuts (#51)

## 3.1.6

* Added support for blocking window destruction (#72)

## 3.1.5

* Updated iconview application launcher and context menu (#51)
* Updated locales

## 3.1.4

* Don't use default app in desktop iconview (#51)

## 3.1.3

* Added desktop iconview (#51)

## 3.1.2

* Support more characters in vfs mountpoint names

## 3.1.1

* Updated logger bindings

## 3.1.0

* Added internal logger

## 3.0.64

* Updated dependencies
* Added 'default application' for choice selection (closes #63)
* Updated npm scripts

## 3.0.63

* Add support for static metadata
* Fix base url when ending with filename (fixes #71)

## 3.0.62

* Window parent will now focus on destruction even if not modal

## 3.0.61

* Added internal keycombo input handler
* Moved 'settings:load' event call
* Updated unit test coverage
* Updated pathJoin in utils to be more flexible

## 3.0.60

* Updated dependencies

## 3.0.59

* Added Auth#register and adapter support
* Fixed unexpected 'this' in window contract
* Updated some provisioning in CoreServiceProvider
* Updated Clipboard service provision
* Split up some stuff in CoreServiceProvider
* Added Session#destroy
* Minor cleanup in CoreServiceProvider
* Updated PackageManager service provision
* Updated Session service provision
* Updated Tray service provision

## 3.0.58

* Added support for configuring notification position (#47)
* Added support for adding className to Notification (#47)

## 3.0.57

* Updated Websocket reconnection implementation
* Removed async keyword from Auth#login
* Updated esdoc
* Updated unit tests

## 3.0.56

* Added configurable HTTP ping
* Added unit tests
* Some minor cleanups and fixes

## 3.0.55

* Allow arbitrary children in login ui fields

## 3.0.54

* Fixed package manifest update causing duplicates

## 3.0.53

* Correctly set window media state on maximize/restore (#37)
* Updated Application#createWindow initialization (#37)
* Fixed double slashes in apps vfs adapter readdir
* Added a check in getActiveElement dom utility

## 3.0.52

* Updated classNames of Windows (Fixes #66)
* Minor cleanup in Websocket class
* Removed debug message on WS messages
* Updated some log levels
* Resolve with boolean in Auth#logout
* Return a promise in Auth#show
* Updated Auth#constructor signature
* Deprecate Application#emitAll
* Updated Application#removeWindow
* Packages#addPackages now fills 'files' if not existing
* Packages#addPackages now returns package list
* Return boolean for Packages#init
* Moved native notification code to utils
* Moved some functions in filesystem.js
* Added missing mount check in Filesystem#_mountAction
* Changed 'deepmerge' import

## 3.0.51

* Stripped away some unwanted stuff from build

## 3.0.50

* Updated Core#broadcast (#64)

## 3.0.49

* Added Core#broadcast (#64)
* If wallpaper src is 'undefined' inherit CSS background (#59)
* Add sound support to notification (#61)

## 3.0.48

* Added new iframe message handler

## 3.0.47

* Fixed WS connection URI behind proxy
* Update manifest on signal even in production mode
* Updated SearchUI abstraction
* Split up Login and the UI code
* Split up Search and SearchUI
* Added config option to disable WS connection
* Split preloader from Packages
* Added configurable manifest uri
* Allow Packages#init to fall through
* Added Packages#addPackages
* Use internal request() for Packages#init
* Updated VFS null method adapter
* Updated vfs docs
* Updated dev dependencies
* Updated osjs/common
* Added eslintignore
* Replaced an async generator with promise
* Split out 'null' adapter for vfs
* Split up auth providers
* Updated some imports
* Moved some VFS files
* Updated library exports
* Split up notification provider code
* Split up auth provider code
* Updated some return states in Window actions
* Added some checks for desktop service in Window
* Settings#get now returns proper default on undefined ns
* Add null user in Core
* Core#open no longer rejects
* Fixed Clipboard#get resolver
* Make sure package manifest is checked as array
* Updated some logging
* Split out Core#url into separate util file

## 3.0.46

* Improve Window#resizeFit (#60)

## 3.0.45

* Fixed parsing of certain backend error messages

## 3.0.44

* Updated system VFS request calls

## 3.0.43

* Updated server auth provider

## 3.0.42

* Support percentages as initial window position (#56)
* Fixed request options getting corrupted
* Support percentages as initial window dimension (#56)

## 3.0.41

* Updated @osjs/event-emitter

## 3.0.40

* HOTFIX: Added missing core class property

## 3.0.39

* Added support for setting 'fetch' options internally

## 3.0.38

* Updated websocket connection handling
* Correctly detect attributes in maximize/minimize (#54)

## 3.0.37

* Fixed desktop panel space calculations (#48)
* Added codeclimate badge to README
* Better handling of singleton app launch queue
* Cleanups
* Added codeclimate config
* Updated some console warning/error messages
* Updated locale esdoc

## 3.0.36

* Added Chinese (zh_CN) translations (#44)

## 3.0.35

* Updated standalone WS handling
* Updated internal parent directory resolver in vfs
* Updated a fetch call
* Removed a leftover debug from application

## 3.0.34

* Updated README
* Updated Vietnamese (vi_VN) translations (#40)
* Updated eslintrc
* Updated copyright(s)

## 3.0.33

* Updated RTL support (#38)

## 3.0.32

* Added direct support for core websocket in applications
* Core now uses custom Websocket class
* Added pointer cursor to window icon
* Click on window icon now brings up context menu
* Double-click on window icon now closes window
* Bind DOM element references earlier in Window
* Removed unused variable<Paste>

## 3.0.31

* Added a generic hook to prevent iframe event blocking

## 3.0.30

* Updated default path to 'home:/'

## 3.0.29

* Added a node check in Window#resizeFit

## 3.0.28

* Fixed an issue with restored window focus
* Added some low-resolution optimization options (#33)
* Added simple loading screen (#36)
* Added navigation prevention
* Update Slovenian (sl_SI) translations (#32)
* Added 'lo-fi' window move/resize

## 3.0.27

* Updated default application
* Updated mime icon mapping

## 3.0.26

* Updated dependencies
* Updated locales

## 3.0.25

* Fixed clicks in search results popup
* Desktop contextmenu now shows proper theme names
* Improved WS establishment handling

## 3.0.24

* Updated application vfs adapter

## 3.0.23

* Update HTTP/WS path configuration and resolution

## 3.0.22

* Fixed issue with WS port not applied properly in some deployments

## 3.0.21

* Fixed arrow keys on input in Firefox (#31)

## 3.0.20

* Added 'running()' to 'osjs/packages' service (#29)

## 3.0.19

* Updated Window 'gravity' support
* Added 'moveable' window attribute (#27)
* Updated 'playSound' error handling
* Add Slovenian (sl_SI) translation to config (#26)

## 3.0.17

* Reapply settings when clear from developer tray contextmenu
* Update settings cache after clear
* Developer tray context menu can now clear settings
* Added Settings#clear for removing a setting by namespace

## 3.0.16

* Added some new translation strings

## 3.0.15

* Fire 'resized' event after maximized/restored (#20)
* Added 'searchable' vfs mountpoint attribute
* Hide serach results on empty list (#25)
* Search now focuses the last acive window on hide (#25)
* Added 'last()' to window service provider

## 3.0.14

* Added customization to Core#url (#22)

## 3.0.13

* Window template can now be set via config
* The 'windows.template' can now be set as a string.
* Now possible to set WindowBehavior via provider option
* CoreServiceProivder now takes 'windowBehavior' option.
* Added update support on tray entries
* Updated fetch() body serializer

## 3.0.12

* Updated contextmenu creation and provider options
* Added 'sessionable' Application option
* Desktop contextmenu can now be customized more
* Updated desktop contextmenu enable check
* Fixed launch notification sticking on invalid themes

## 3.0.11

* Updated webpack config to not inline css sourcemap in production

## 3.0.10

* Improved fetch() error handling

## 3.0.9

* Added german language to configurations

## 3.0.8

* Fixed incorrect datetime formats in config
* Added German (de_DE) translations (#17)

## 3.0.7

* Updated url() in system vfs adapter

## 3.0.6

* Updated some theme resource resolution

## 3.0.4

* Added a check for applying wallpaper
* Added 'desktop.contextmenu' configuration

## 3.0.3

* Updated configuration

## 3.0.2

* Fixed windows getting clamped outside viewport
* Add Slovenian (sl_SI) translation (#18)

## 3.0.1

* Updated @osjs/common, added @osjs/event-emitter

## 3.0.0-alpha.85

* Added 'osjs/basic-application' as provider

## 3.0.0-alpha.84

* Application#request now reflects Core#request

## 3.0.0-alpha.82

* Added French (fr_FR) translations (#16)
* Updated some destructors
* Updated @osjs/common
* Updated dependencies
* Updated some destructors etc.
* Fixed call to undefined method in desktop destructor
* Added login/logout sounds
* Support custom window templates
* Some optimization to window and behavior

## 3.0.0-alpha.81

* Updated sound configurations

## 3.0.0-alpha.80

* Don't mount similar mountpoints (duplicates)
* Removed 'getWindows' from global OSjs namespace
* Removed 'getApplications' from global OSjs namespace
* Added 'osjs/windows' provider
* Some minor assignment updates for certain window attributes
* Clamp initial window position if outside viewport
* Don't allow multiple render() in window
* Run init() on window in render() if not inited

## 3.0.0-alpha.79

* Configuration of allowed global provider access
* Some minor opimizations in keydown handler
* Don't allow tabbing of elements outside active window
* Prevent tab character in text fields
* Updated globally exposed providers

## 3.0.0-alpha.78

* Changed 'ev' in event signatures for window

## 3.0.0-alpha.77

* Added some more exports to library
* Notification now supports native APIs
* Windows now supports Shadow DOM
* Moved some core provider services

## 3.0.0-alpha.76

* Updated dependencies

## 3.0.0-alpha.75

* Updated @osjs/common usage

## 3.0.0-alpha.74

* Updated @osjs/common for breaking Babel change

## 3.0.0-alpha.73

* Updated @osjs/common

## 3.0.0-alpha.72

* Updated dependencies

## 3.0.0-alpha.71

* Added default VFS adapter config
* Added OSjs.register shortcut for package registration
* Split out some code from core service provider
* Updated @osjs/common dependency
* Restrict removal of core events


## 3.0.0-alpha.70

* Improved background setting and options on desktop
* Desktop wallpaper can now be VFS File object
* Added languages to config

## 3.0.0-alpha.69

* Removed some deprecated services in core

## 3.0.0-alpha.68

* Added 'onerror' handler to Websocket class

## 3.0.0-alpha.67

* Updated dependencies
* Added vi_VN locales (#15)
* Windows now resizable from all corners (#14)
* Removed '?_time=...' query parameter from preloads

## 3.0.0-alpha.66

* Fixed preloading of external resources in metadata

## 3.0.0-alpha.65

* Added configuration to disable search feature
* Added proper fallback in locale functions

## 3.0.0-alpha.64

* Tiny fix for package manager metadata loading"

## 3.0.0-alpha.63

* Removed deprecated '_path' attribute in metadata
* Updated WebSocket esdoc
* Added Websocket to provider
* Renamed 'ApplicationSocket' to 'Websocket'
* Use browser locale by default

## 3.0.0-alpha.62

* Updated error dialog in package manager
* Removed unused favicon.png

## 3.0.0-alpha.61

* Focus the first created application window (#12)
* Updated locales
* Added 'setLocale' and change event
* Added 'nb_NO' locales

## 3.0.0-alpha.60

* Updated some window event signatures

## 3.0.0-alpha.59

* Fixed custom login UI configuration

## 3.0.0-alpha.58

* Hotfix for chrome behavioural change

## 3.0.0-alpha.57

* Updated some VFS method exposure
* Updated some VFS method HTTP methods
* Some minor fixes to internal fetch() wrapper
* Added 'touch' VFS endpoint
* Support 'passive' touch events on Windows
* Updated some logging messages

## 3.0.0-alpha.56

* Support icon theme type packages

## 3.0.0-alpha.55

* Hot-reload CSS changes in dev mode
* Update @osjs/common

## 3.0.0-alpha.54

* Added some missing events to global window getter
* Added DnD to Windows
* Added DnD utils + provider
* Added some native touch gesture prevention
* Add shortcut of making tray entries<Paste>

## 3.0.0-alpha.52

* Added missing 'wid' for global window getter API
* Add some restrictions to OSjs global object in prod mode
* Moved some util methods to util files
* Removed unused file
* Updated tray creation options
* Throw Error on invalid notification creation
* Fixed eslint comment warnings

## 3.0.0-alpha.51

* Removed a gitignore file leading to missing files in npm package

## 3.0.0-alpha.50

* Prebuild npm package

## 3.0.0-alpha.49

* Separate server root and client root

## 3.0.0-alpha.48

* Added http server configuration options
* Mountpoint passed on in VFS adapter methods
* Added 'enabled' option for mountpoints
* Added 'apps' VFS adapter and mountpoint
* Core#url can now resolve package files as well
* Added 'icon' property to file stat object
* Added 'visibility' mountpoint attribute
* Updated configuration
* Support 'osjs/application' as mime for open()

## 3.0.0-alpha.47

* Window 'position' option can now alias as 'gravity' (Fixes #13)
* Added all gravity positions (#13)
* Prevent a debug message from spamming console
* Added 'move' alias for 'rename' in VFS
* Support copy/move between different adapters in VFS
* Add the 'root' attribute for mountpoints
* Added mountpoint icon support
* Added VFS search UI
* Updated eslintrc

## 3.0.0-alpha.46

* Updated @osjs/common dependency

## 3.0.0-alpha.45

* Fixed using VFS paths with strings only
* Added VFS search() method
* Added travis-ci badge to README
* Lint pass
* Added initial travis-ci config
* Added stylelintrc


## 3.0.0-alpha.44

* Added 'download' for system vfs
* Added native 'download' support in VFS
* Better notifications, added icon support
* Added basic clipboard provider

## 3.0.0-alpha.43

* Support registering custom contextmenu items on desktop

## 3.0.0-alpha.42

* Updated @osjs/common dependency
* Added CSS to force acceleration in certain browsers
* Flatten som styles in _window.scss

## 3.0.0-alpha.41

* Hotfix for auth ui login submission

## 3.0.0-alpha.40

* Hide login UI if autologin is set (prevent blink)
* Added missing return statement
* Prevent crash on startup when app meta not found for restore
* Fixed text selection on non-webit browsers
* Updated zIndex handling of windows


## 3.0.0-alpha.39

* Added missing 'attributes' property from global getWindows() method

## 3.0.0-alpha.38

* VFS api now uses objects instead of strings for input paths
* Moved a vfs util method
* Added #provides to all providers
* Updated vfs mounting process
* Added 'osjs/dom' provider
* Added 'visiblity' attribute to Window

## 3.0.0-alpha.37

* Updated some settings handling
* Ensure 'params' from websocket message

## 3.0.0-alpha.36

* Added 'ping' to server based on cookie lifetime
* Themes now supports scripts and launching
* Better theme handling
* Refactored some async/await to promises
* Expose 'preload' to packages provider
* Package preload now returns element map
* Changed login logo to contain
* Better import/export pattern for locales

## 3.0.0-alpha.35

* Only show choice selector when > 1 apps
* Removed unwanted console message

## 3.0.0-alpha.34

* Add support for custom login ui via provider (#6)
* Added logo support to login (#11)
* Prevent window destroy observation event on application destroy


## 3.0.0-alpha.33

* Settings now uses namespaced tree
* Added desktop contextmenu
* Prevent blinking of window when gravitating on init
* Updated launch choice dialog usage
* Updated application metadata docs

## 3.0.0-alpha.32

* Fixed custom post data in fetch()
* Separated Settings from SettingsProvider
* Added settings lock for desktop and settings manager (#3)
* Implemented choice dialog for opening files (if avail)
* Added PackageManager#getCompatiblePackages
* Separated fetch() implementation
* Updated some translation strings
* Add error dialog in application launch failures
* Added PackageManager#getPackages and more access control
* Updated packagemanager service provider
* Added Core#getUser

## 3.0.0-alpha.31

* Added util function for getting browser locale
* Fix fetch() not posting data
* Separated locale strings to language file
* Updated emitAll() signature in application
* Added parent window modal attribute support

## 3.0.0-alpha.30

* Added application settings save/load
* Added date/time localization support
* Removed unused dependencies
* Properly signal 'attention' on singleton applications
* Better handling of window init position
* Change default window position values to 'null'
* Separated some code in desktop provider
* Added translation support for flat dicts
* Added translation provider and core implementation
* Updated some settings management
* Added a try/catch in core boot
* Fix notification z-index (#9)

## 3.0.0-alpha.29

* Fixed an issue relating to desktop settings (#8)

## 3.0.0-alpha.28

* Fixed reloading of singleton application (#7)
* Updated package metadata documentation
* Added preliminary widget support to desktop
* Added 'osjs/desktop:transform' event when desktop rect changes
* Removed some unused code from config.js

## 3.0.0-alpha.27

* Updated desktop space based on panels
* Ctrl+click can now move windows from any spot
* Remove 'body' on fetch() requests when using GET
* Added tab handling for text boxes etc.
* Prevent user-select on window base elements
* Allow window controls to overflow
* Updated package metadata documentation
* A small correction for some window documentation


## 3.0.0-alpha.26

* Added 'autostart' support for packages (#4)
* Updated Window attributes (#5)
* Panel init now takes place in desktop
* Updated some public OSjs getters
* Updated desktop applySettings
* Removed mapping in Window.getWindows

## 3.0.0-alpha.25

* Updated Application resouce() and socket()

## 3.0.0-alpha.24

* Added 'osjs/theme' service

## 3.0.0-alpha.23

* Added proper pathJoin method
* Prevent navigating away when dropping files on desktop
* Added 'showHiddenFiles' option for scandir transform
* Update z-index for loading overlay in window
* Add missing size property to special directory in vfs
* Fixed an issue with parentDirectory() resolve
* Added Application.destroyAll method
* Promise-ified Application#request
* Added proper mount/unmount in filesystem
* Cleaned up some async code
* Don't transform URIs in 'resource()' in application
* Added 'worker()' method for creation in application

## 3.0.0-alpha.22

* Remove 'registerDefault' from Core options

This requires the distribution to manually register base providers.
See 'index.js' in the base repository.

## 3.0.0-alpha.21

* Fixed an issue relating to input form field generation

## 3.0.0-alpha.20

* Added Application#emitAll for event broadcasting
* Improved login screen and customization options

## 3.0.0-alpha.19

* Added npmignore
* Added CHANGELOG

## v3.0.0-alpha.18

* Added a method for getting file icon from stat
* Remove previously registered packages
* Added relaunch of apps from server signal
* Fixed wrong assignment of getApplication in global namespace

## v3.0.0-alpha.17

* Added reconnection of websocket
* Added message handling of internal websocket
* Make sure file iters in VFS follow format
* Use Promise style in VFS

## v3.0.0-alpha.16

* A more functional aproach in VFS

## v3.0.0-alpha.15

* A more functional approach for Auth + Settings

## v3.0.0-alpha.13

* Prevent background scroll on iOS
* Updated boot flow
* Added some error handling for settings loading
* Fixed window buttons for iOS rendering issues
* Correction in default settings configuration

## v3.0.0-alpha.12

* Better default settings handling and configuration
* Added basic support for desktop settings
* Merged MergeServiceProvider into Desktop
* Emit events on settings actions
* Updated provider loading
* Strip some unwanted strings from built URLs
* Better auth flow
* Updated desktop provider exposed methods
* Standalone mode now works
* Separate Login UI from Auth adapter
* Better default Settings & Auth abstraction
* Added Settings adapter configuration.
* Removed an unused variable
* Allow setting Settings handler via bootstrap
* Split up Settings to own provider
* Better load/save in Settings
* Added default settings in Settings
* Export Settings class
* Return entire tree in Settings#get() when no key given
* Updated settings service
* Added some default user settings to the config tree
* Split default config + CoreBase update
* Now using '@osjs/common' module
* Added loading state to login and some UI improvements
* Properly handle authentication errors
* Added support for passing on default provider options
* Fixed some Safari incompabilities

## v3.0.0-alpha.11

* Updated some errors in stylesheets

## v3.0.0-alpha.10

* Renamed npm module to '@osjs/client'
* Added default 'home' mountpoint
* Add same-origin credentials to fetch()
* Moved 'message' event listener
* Updated mountpoint property generation
* Use 'deepmerge' for configs
* Make sure parent dir always ends with slash in resolver
* Update special folder creation in vfs
* Don't emit launch event in packages on singleton block
* Prefix VFS path with mountpoint names
* Added 'defaultPath' config to VFS
* Moved some VFS configuration to core
* Updated hyperapp dependency
* Updated auth login ui building
* Support for specifying what Auth class to use in provider
* Clean up 'running' in package manager whan application is destroyed
* Remove pointer events on iframes in un-focused windows
* Added singleton application support
* Fixed a pid check for message handling
* Update Application::getApplications() usage
* Updated args handling in 'message' sink
* Changed 'data' to 'args' in 'message' event sink
* Accept 'message' on window and route to appropriate proc
* Added 'emit()' for application in getApplications map

## v3.0.0-alpha.9

* Added default favicon
* Use destruct state in notification destructor
* Add proper z-index for notifications
* Added copy() VFS method
* Added proxy for vfs methods
* Fixed exception on theme provider destruct
* Update mountpoint initialization
* Updated exports and some docs
* Updated docs
* Started on VFS transport abstraction
* Implemented writefile() in VFS

## v3.0.0-alpha.8

* Added theme loading
* Updated application categories

## v3.0.0-alpha.7

* Added esdoc config
* Added more exports to index
* Removed DefaultServiceProvider
* Split up 'Desktop' and 'Auth' classes from providers
* Added 'sessionable' attribute to window
* Started on mountpoint/transport handling in FS
* Added some docs to register() method in core
* Added local media query support to windows
* Now using new request() for certain APIs
* Added Core::request() for fetch() wrapping
* Append resize/move result to event emit in behavior
* Moved a preventDefault in window behavior


## v3.0.0-alpha.6

* Updated verbosity of service provider registartion logs
* Prevent NaN in human readable size conversion
* Do not prevent mousedown default on inputs in window beahviour
* Added some cache busting for preloads
* Merged 'PackageServiceProvider' into 'CoreServiceProvider'
* Renamed 'PackageManager' to 'Packages'
* Added esdoc definitions for certain Window stuff
* Updated provider esdoc
* Re-arranged utils namespaces
* Moved utils to a subdirectory
* Updated esdoc
* Documented package metadata
* Application relaunch now also includes window sessions
* Updated esdoc
* Updated some logging
* Added simple debugging tray icon
* Fixed tray destruction
* Added relaunch() to application
* Fix FF issue with text selection
* Added application categories to config
* Added 'osjs/core' provder w/methods
* Added Core::config()
* Properly remove Window when destructed from application
* Added tray handling
* Added creation event in Application
* Changed some package-manager launch event names
* Await (ws) connection before proceeding with startup
* Split up configuration generation in core
* PackageManager now generates URLs via core
* Hide (context)menus when window event is triggered
* EventHandler now accepts comma spearated string or string[] as event names
* Corrected URLs in package.json

## v3.0.0-alpha.5

Initial public release
