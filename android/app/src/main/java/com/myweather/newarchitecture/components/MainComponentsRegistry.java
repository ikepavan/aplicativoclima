package com.myweather.newarchitecture.components;

import com.facebook.jni.HybridData;
import com.facebook.proguard.annotations.DoNotStrip;
import com.facebook.react.fabric.ComponentFactory;
import com.facebook.soloader.SoLoader;


@DoNotStrip
public class MainComponentsRegistry {
  static {
    SoLoader.loadLibrary("fabricjni");
  }

  @DoNotStrip private final HybridData mHybridData;

  @DoNotStrip
  private native HybridData initHybrid(ComponentFactory componentFactory);

  @DoNotStrip
  private MainComponentsRegistry(ComponentFactory componentFactory) {
    mHybridData = initHybrid(componentFactory);
  }

  @DoNotStrip
  public static MainComponentsRegistry register(ComponentFactory componentFactory) {
    return new MainComponentsRegistry(componentFactory);
  }
}
