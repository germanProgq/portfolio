#![no_std]

use core::panic::PanicInfo;

#[no_mangle]
pub extern "C" fn smooth_axis(current: f32, target: f32, lerp: f32, snap_epsilon: f32) -> f32 {
    let delta = target - current;

    if delta.abs() < snap_epsilon {
        target
    } else {
        current + delta * lerp
    }
}

#[panic_handler]
fn panic(_: &PanicInfo) -> ! {
    loop {}
}
