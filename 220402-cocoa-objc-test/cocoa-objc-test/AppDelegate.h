//
//  AppDelegate.h
//  cocoa-objc-test
//
//  Created by low on 2022/03/30.
//

#import <Cocoa/Cocoa.h>

@class Track;

@interface AppDelegate : NSObject <NSApplicationDelegate, NSWindowDelegate>

@property (strong) IBOutlet NSWindow *window;
@property (weak) IBOutlet NSTextField *textField;
@property (weak) IBOutlet NSSlider *slider;
@property (strong) Track *track;

- (IBAction)mute:(id)sender;
- (IBAction)takeFloatValueForVolumeFrom:(id)sender;

- (void)updateUserInterface;
@end

