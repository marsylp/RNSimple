package com.example.myapplication;

import androidx.annotation.Nullable;

import com.facebook.react.ReactActivity;

public class BaseRnActivity extends ReactActivity {
    @Nullable
    @Override
    protected String getMainComponentName() {
        return "rn_simple";
    }
}
