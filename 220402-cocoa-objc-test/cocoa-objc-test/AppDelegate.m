//
//  AppDelegate.m
//  cocoa-objc-test
//
//  Created by low on 2022/03/30.
//

#import "AppDelegate.h"
#import "Track.h"

@interface AppDelegate ()
@end

@implementation AppDelegate
@synthesize textField;
@synthesize slider;

- (IBAction)mute:(id)sender {
    NSLog(@"received a mute: message");
    [self.track setVolume:0.0];
    [self updateUserInterface];
}
- (IBAction)takeFloatValueForVolumeFrom:(id)sender {
    NSString *senderName = nil;
    if (sender == self.textField) {
        senderName = @"textField";
    }
    else {
        senderName = @"slider";
    }
    NSLog(@"%@ sent takeFloatValueForVolumeFrom: with value %1.2f", senderName, [sender floatValue]);
    
    float newValue = [sender floatValue];
    [self.track setVolume:newValue];
    [self updateUserInterface];
}

- (void)applicationDidFinishLaunching:(NSNotification *)aNotification {
    Track *aTrack = [[Track alloc] init];
    [self setTrack:aTrack];
    [self updateUserInterface];
//    [self.window setCanHide:NO];
    // fn+f11로는 반응이 없음
    [self.window setCollectionBehavior:NSWindowCollectionBehaviorCanJoinAllSpaces|NSWindowCollectionBehaviorStationary];
//    [self.window setHidesOnDeactivate:YES];
    // Insert code here to initialize your application
    [self.window setLevel:kCGNormalWindowLevel + 1];
    // 데스크탑 아이콘레벨로 설정하면 fn+f11을 방지하고 UI도 사용가능하지만 포커싱을 잃으면 윈도우 클릭이 불가능, 이방법이 아닌것으로 보임, Sticky Note는 Always on bottom으로 구현되지 않았음
    NSLog(@"%i", (int)NSWindowCollectionBehaviorCanJoinAllSpaces);
    NSLog(@"window.level: %id",(int) self.window.level);
    NSLog(@"window.canHide: %id", self.window.canHide);
    
//    [[NSNotificationCenter defaultCenter] addObserver:self
//                                             selector:@selector(windowDidUpdate:)
//                                                 name:@"NSWindowDidUpdateNotification"
//                                               object:nil];
    // 확인해봤으나 fn+f11은 로그가 찍히지 않음. 창이벤트가 아닌 것으로 보임
        [[NSNotificationCenter defaultCenter] addObserver:self
                                                 selector:@selector(windowWillMove:)
                                                     name:NSWindowWillMoveNotification
                                                   object:nil];
    // 창이벤트 외 이벤트 확인 필요
}


- (void)applicationWillTerminate:(NSNotification *)aNotification {
    // Insert code here to tear down your application
}


- (BOOL)applicationSupportsSecureRestorableState:(NSApplication *)app {
    return YES;
}

- (void)windowDidUpdate:(NSNotification *)notification {
    NSLog(@"test 123");
}

- (void)windowWillMove:(NSNotification *)notification {
    NSLog(@"will move");
}

- (void)updateUserInterface {
    float volume = [self.track volume];
    [self.textField setFloatValue:volume];
    [self.slider setFloatValue:volume];
}
@end
