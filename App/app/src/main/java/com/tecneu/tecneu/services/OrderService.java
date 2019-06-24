package com.tecneu.tecneu.services;

import android.content.Context;
import android.content.SharedPreferences;
import android.preference.PreferenceManager;

import com.android.volley.AuthFailureError;
import com.android.volley.Request;
import com.android.volley.RequestQueue;
import com.android.volley.toolbox.JsonObjectRequest;
import com.android.volley.toolbox.StringRequest;
import com.android.volley.toolbox.Volley;
import com.google.gson.Gson;
import com.google.gson.GsonBuilder;
import com.google.gson.reflect.TypeToken;
import com.tecneu.tecneu.R;
import com.tecneu.tecneu.models.Order;
import com.tecneu.tecneu.models.Provider;

import org.json.JSONException;
import org.json.JSONObject;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.Map;

public class OrderService {
    public static void createOrder(Context context, String company, String name, String email, long phoneNumber, OnRequest onRequest) throws JSONException {
        RequestQueue queue = Volley.newRequestQueue(context);
        String url = context.getString(R.string.api_url) + "/providers";

        JSONObject request = new JSONObject();
        request.put("company", company);
        request.put("name", name);
        request.put("email", email);
        request.put("phoneNumber", phoneNumber);

        JsonObjectRequest jsObjRequest = new JsonObjectRequest(Request.Method.POST, url, request,
                response -> onRequest.onSuccess(null),
                error -> onRequest.onError()) {
            @Override
            public Map<String, String> getHeaders() throws AuthFailureError {
                Map<String, String> headers = new HashMap<>();
                headers.put("Content-Type", "application/json");
                headers.put("Authorization", "Bearer " + UserService.getToken(context));
                return headers;
            }
        };
        queue.add(jsObjRequest);
    }

    public static void getAllOrders(Context context, OnRequest onRequest) {
        RequestQueue queue = Volley.newRequestQueue(context);
        String url = context.getString(R.string.api_url) + "/orders";

        StringRequest jsObjRequest = new StringRequest(Request.Method.GET, url,
                response -> {
                    Gson gson = new GsonBuilder().setDateFormat("dd-MM-yyyy HH:mm:ss").create();

                    ArrayList<Order> users = gson.fromJson(response, new TypeToken<ArrayList<Order>>(){}.getType());
                    onRequest.onSuccess(users);
                },
                error -> onRequest.onError()) {
            @Override
            public Map<String, String> getHeaders() {
                Map<String, String> headers = new HashMap<>();
                headers.put("Content-Type", "application/json");
                headers.put("Authorization", "Bearer " + UserService.getToken(context));
                return headers;
            }
        };
        queue.add(jsObjRequest);
    }

    public static void modifyProvider(Context context, Provider provider, OnRequest onRequest) throws JSONException {
        SharedPreferences sharedPreferences = PreferenceManager.getDefaultSharedPreferences(context);
        RequestQueue queue = Volley.newRequestQueue(context);
        String url = context.getString(R.string.api_url) + "/providers/" + provider.id;
        Gson gson = new Gson();
        JSONObject object = new JSONObject(gson.toJson(provider));

        JsonObjectRequest jsObjRequest = new JsonObjectRequest(Request.Method.PUT, url, object,
                response -> onRequest.onSuccess(null),
                error -> onRequest.onError()) {
            @Override
            public Map<String, String> getHeaders() throws AuthFailureError {
                Map<String, String> headers = new HashMap<>();
                headers.put("Content-Type", "application/json");
                headers.put("Authorization", "Bearer " + UserService.getToken(context));
                return headers;
            }

        };
        queue.add(jsObjRequest);
    }

    public static void deleteProvider(Context context, int providerId, OnRequest onRequest) {
        SharedPreferences sharedPreferences = PreferenceManager.getDefaultSharedPreferences(context);
        RequestQueue queue = Volley.newRequestQueue(context);
        String url = context.getString(R.string.api_url) + "/providers/" + providerId; // xd providerss

        StringRequest jsObjRequest = new StringRequest(Request.Method.DELETE, url,
                response -> {
                    onRequest.onSuccess(null);
                },
                error -> onRequest.onError()) {
            @Override
            public Map<String, String> getHeaders() throws AuthFailureError {
                Map<String, String> headers = new HashMap<>();
                headers.put("Content-Type", "application/json");
                headers.put("Authorization", "Bearer " + UserService.getToken(context));
                return headers;
            }

        };
        queue.add(jsObjRequest);
    }
}