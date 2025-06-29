"use client";

import React, { use } from "react";
import { useState, useEffect } from "react";
import { createClient } from '@supabase/supabase-js'

// Create a single supabase client for interacting with your database

function MainComponent() {
  const supabase = createClient(process.env.NEXT_PUBLIC_SUP_URL, process.env.NEXT_PUBLIC_API_KEY)
  const [level,setLevel]=useState(0)
  const [timestamp,setTime]=useState(new Date().toDateString())
  const filldata=async ()=>{
    const { data, error } = await supabase
    .from('cec-table')
    .select().order("created_at",{"ascending":false}).limit(1)
    console.log(data);
    setLevel(data[0]["percentage"])
    setTime(data[0]["created_at"])
    setNotifications(
      [{
        id: 0,
        message: "Bin Status",
        fillLevel: data[0]["percentage"],
        time: data[0]["created_at"],
        read: "NA",
        color:
        
          ( data[0]["percentage"] >= 90
            ? "#ef4444"
            : data[0]["percentage"] >= 75
            ? "#eab308"
            : "#7BC5AC"),
        notificationType: "capacity",
      }]
    );
    
  }
  useEffect(()=>{
    filldata()
    setInterval(filldata,1500);
  
    
  },[])

  const [bins, setBins] = useState([
    {
      id: 1,
      name: "Smart Bin",
      location: "Main Area",
      fillLevel: 0,
      lastUpdated: new Date().toISOString(),
    },
  ]);
  const [notifications, setNotifications] = useState([]);
  const [darkMode, setDarkMode] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [refreshing, setRefreshing] = useState(false);
  const [showMap, setShowMap] = useState(false);
  const binLocation = { lat: 19.1867, lng: 72.8493 };
  const binLocations = [
    { lat: 19.1867, lng: 72.8493, name: "Smart Bin A" },
    { lat: 19.189, lng: 72.848, name: "Smart Bin B" },
    { lat: 19.185, lng: 72.851, name: "Smart Bin C" },
  ];
  const collectors = [
    {
      id: 1,
      name: "Arun Patel",
      location: { lat: 19.187, lng: 72.849 },
      rating: 4.8,
      available: true,
    },
    {
      id: 2,
      name: "Raj Kumar",
      location: { lat: 19.186, lng: 72.8495 },
      rating: 4.6,
      available: true,
    },
  ];
  const getFillLevelColor = (level) => {
    if (level >= 90) return "bg-[#ef4444]";
    if (level >= 75) return "bg-[#eab308]";
    return "bg-[#7BC5AC]";
  };
  const getNotificationMessage = (level) => {
    if (level >= 90)
      return "Critical Alert: Bin is full and requires immediate attention";
    if (level >= 75) return "Warning: Bin capacity reaching critical levels";
    return null;
  };
  const toggleMap = () => {
    setShowMap(!showMap);
  };
  const fetchData = async () => {
    try {
      const [readingsResponse, notificationsResponse] = await Promise.all([
        fetch("/api/get-bin-readings", { method: "POST" }),
        fetch("/api/get-notifications", { method: "POST" }),
      ]);

      if (!readingsResponse.ok || !notificationsResponse.ok) {
        throw new Error("Failed to fetch data");
      }

      const { readings } = await readingsResponse.json();
      const { notifications: notifs } = await notificationsResponse.json();

      const latestReading = readings[0];
      if (latestReading) {
        setBins([
          {
            id: 1,
            name: "Smart Bin",
            location: "Main Area",
            fillLevel: latestReading.fill_level,
            lastUpdated: latestReading.timestamp,
          },
        ]);
      }

      const filteredNotifs =
        notificationFilter === "all"
          ? notifs
          : notifs.filter((n) => n.notification_type === notificationFilter);

      setNotifications(
        filteredNotifs.map((n) => ({
          id: n.id,
          message: n.message,
          fillLevel: n.fill_level,
          time: n.created_at,
          read: n.is_read,
          color:
            n.color ||
            (n.fill_level >= 90
              ? "#ef4444"
              : n.fill_level >= 75
              ? "#eab308"
              : "#7BC5AC"),
          notificationType: n.notification_type,
        }))
      );
    } catch (err) {
      console.error(err);
      setError("Failed to fetch data");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };
  const handleRefresh = async () => {
    setRefreshing(true);
    filldata()
    //await fetchData();
  };
  const markAsRead = async (notificationId) => {
    try {
      const response = await fetch("/api/mark-notification-read", {
        method: "POST",
        body: JSON.stringify({ notificationId }),
      });

      if (!response.ok) {
        throw new Error("Failed to mark notification as read");
      }

      setNotifications(
        notifications.map((notif) =>
          notif.id === notificationId ? { ...notif, read: true } : notif
        )
      );

      if ("vibrate" in navigator) {
        navigator.vibrate(200);
      }
    } catch (err) {
      console.error(err);
      setError("Failed to mark notification as read");
    }
  };
  const toggleDarkMode = () => {
    setDarkMode(!darkMode);
    if ("vibrate" in navigator) {
      navigator.vibrate(100);
    }
  };
  const [notificationFilter, setNotificationFilter] = useState("all");

  useEffect(() => {
    fetchData();
  }, []);

  return (
    <div className="min-h-screen bg-white pb-[calc(80px+env(safe-area-inset-bottom))]">
      <header className="fixed top-0 left-0 right-0 bg-white shadow-md z-40">
        <div className="px-4 py-3 flex items-center justify-between">
          <div className="flex items-center">
            <i className="fas fa-recycle text-2xl text-[#7BC5AC] mr-2"></i>
            <h1 className="text-xl font-bold text-gray-800 font-inter">
              Bin<span className="text-[#7BC5AC]">IT</span>
            </h1>
          </div>
          <div className="md:hidden">
            <span className="text-sm text-[#7BC5AC] font-semibold">v2.0</span>
          </div>
          <div className="hidden md:flex items-center">
            <p className="text-sm text-gray-600 mr-6">
              Powered by EcoTech Solutions
            </p>
            <nav>
              <ul className="flex items-center space-x-6">
                <li className="text-[#7BC5AC] font-inter font-medium cursor-pointer px-4 py-2 rounded-lg">
                  Overview
                </li>
                <li>
                  <button
                    onClick={toggleDarkMode}
                    className="text-[#7BC5AC] w-11 h-11 flex items-center justify-center"
                  >
                    <i
                      className={`fas ${
                        darkMode ? "fa-sun" : "fa-moon"
                      } text-2xl`}
                    ></i>
                  </button>
                </li>
              </ul>
            </nav>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-24 md:pt-24 pb-[120px] md:pb-8">
        <div className="flex flex-col items-center">
          <div className="flex items-center mb-12 transform hover:scale-105 transition-all duration-300">
            <i className="fas fa-recycle text-6xl text-[#7BC5AC] mr-4 icon-pulse"></i>
            <h1 className="text-4xl font-bold text-gray-800 font-inter group relative">
              Bin<span className="text-[#7BC5AC]">IT</span>
              <span className="ml-3 text-sm bg-gradient-to-r from-[#7BC5AC] to-[#6ab59b] text-white px-4 py-1 rounded-full shadow-lg transform hover:scale-105 transition-all duration-300">
                SMART
              </span>
              <span className="ml-2 text-sm text-[#7BC5AC] font-semibold border-2 border-[#7BC5AC] px-2 py-1 rounded-lg">
                v2.0
              </span>
              <span className="absolute -bottom-2 left-0 w-full h-0.5 bg-[#7BC5AC] transform scale-x-0 transition-transform duration-300 group-hover:scale-x-100"></span>
            </h1>
          </div>
          <p className="text-gray-600 font-inter mb-12 hover:text-[#7BC5AC] transition-all duration-300 transform hover:scale-105">
            Intelligent Waste Management System
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 w-full mb-12">
            <div className="bg-gradient-to-br from-white to-[#f8fafc] rounded-xl shadow-lg hover:shadow-2xl transition-all duration-300 p-6">
              <h2 className="text-xl font-bold text-gray-800 font-inter mb-6">
                Overall Dustbin Status
              </h2>
              <div className="relative w-64 h-64 mx-auto mb-4">
                <div className="w-full h-full rounded-full border-8 border-gray-100 relative overflow-hidden shadow-lg">
                  <div
                    className={`absolute inset-0 rounded-full transition-all duration-1000 ease-in-out ${getFillLevelColor(
                     level
                    )} fill-animation`}
                    style={{
                      clipPath: `inset(${100 - level}% 0 0 0)`,
                      transform: "translateZ(0)",
                      background: `linear-gradient(to bottom, ${
                        level >= 90
                          ? "#ff6b6b, #ef4444"
                          : level>= 75
                          ? "#fcd34d, #eab308"
                          : "#86efac, #7BC5AC"
                      })`,
                    }}
                  />
                  <div className="absolute inset-0 flex items-center justify-center">
                    <span className="text-4xl font-bold text-gray-800 font-inter">
                      {level}%
                    </span>
                  </div>
                </div>
                {loading && (
                  <div className="absolute inset-0 flex items-center justify-center bg-white bg-opacity-50 rounded-full">
                    <i className="fas fa-spinner fa-spin text-[#7BC5AC] text-3xl"></i>
                  </div>
                )}
              </div>
              <button
                onClick={handleRefresh}
                disabled={loading}
                className="w-full px-4 py-3 bg-gradient-to-r from-[#7BC5AC] to-[#6ab59b] text-white rounded-lg font-inter hover:from-[#6ab59b] hover:to-[#5aa58b] transform hover:scale-105 transition-all duration-300 shadow-lg disabled:opacity-50"
              >
                <i
                  className={`fas ${
                    loading ? "fa-spinner fa-spin" : "fa-sync-alt"
                  } mr-2`}
                ></i>
                Refresh Status
              </button>
            </div>

            <div className="bg-gradient-to-br from-white to-[#f8fafc] rounded-xl shadow-lg hover:shadow-2xl transition-all duration-300 p-6">
              <div className="mb-6">
                <h3 className="text-lg font-semibold text-gray-800 font-inter mb-4">
                  Status Details
                </h3>
                <div className="space-y-3">
                  <div className="flex justify-between hover:bg-[#ebf7f4] p-3 rounded-lg transition-all duration-300">
                    <span className="text-gray-600 flex items-center">
                      <i className="fas fa-chart-pie text-[#7BC5AC] mr-2"></i>
                      Available Capacity
                    </span>
                    <span className="font-bold text-[#7BC5AC]">{level}%</span>
                  </div>
                  <div className="flex justify-between hover:bg-[#ebf7f4] p-3 rounded-lg transition-all duration-300">
                    <span className="text-gray-600 flex items-center">
                      <i className="fas fa-truck text-[#7BC5AC] mr-2"></i>
                      Collection Status
                    </span>
                    <span className="text-[#7BC5AC] font-bold">Normal</span>
                  </div>
                  <div className="flex justify-between hover:bg-[#ebf7f4] p-3 rounded-lg transition-all duration-300">
                    <span className="text-gray-600 flex items-center">
                      <i className="fas fa-clock text-[#7BC5AC] mr-2"></i>Last
                      Updated
                    </span>
                    <span className="text-[#7BC5AC] font-bold">{new Date(timestamp).toTimeString()}</span>
                  </div>
                </div>
              </div>
              <div className="bg-[#ebf7f4] rounded-lg p-4 hover:bg-[#e0f2ed] transition-all duration-300 transform hover:scale-105">
                <div className="flex items-center">
                  <i className="fas fa-check-circle text-[#7BC5AC] text-2xl mr-2"></i>
                  <span className="font-medium text-[#7BC5AC]">
                    All Systems Operational
                  </span>
                </div>
              </div>
            </div>
          </div>

          <div className="w-full border border-gray-200 rounded-lg p-6 shadow-lg hover:shadow-2xl transition-all duration-300 bg-gradient-to-br from-white to-[#f8fafc] mb-12">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-[#1f2937] font-inter">
                Critical Notifications
              </h2>
              <div className="flex items-center">
                <span className="text-sm text-gray-500 mr-4">Filter by:</span>
                <select
                  className="bg-white border border-gray-200 rounded-lg px-3 py-2 text-sm"
                  onChange={(e) => setNotificationFilter(e.target.value)}
                >
                  <option value="all">All</option>
                  <option value="capacity">Capacity</option>
                  <option value="system">System</option>
                  <option value="collection">Collection</option>
                </select>
              </div>
            </div>
            {notifications.length === 0 ? (
              <div className="flex items-center justify-center p-6 bg-[#ebf7f4] rounded-lg transform hover:scale-105 transition-all duration-300">
                <i className="fas fa-check-circle text-[#7BC5AC] text-2xl mr-2"></i>
                <p className="text-gray-600 text-sm font-inter">
                  No alerts - Bin levels normal
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {notifications.map((notification) => (
                  <div
                    key={notification.id}
                    className={`p-6 rounded-lg ${
                      notification.read ? "bg-[#f8fafc]" : "bg-white"
                    } border border-gray-100 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-102 border-l-4`}
                    style={{ borderLeftColor: notification.color }}
                  >
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <div className="flex items-center mb-3">
                          <i
                            className={`fas ${
                              notification.notificationType === "capacity"
                                ? "fa-exclamation-triangle"
                                : notification.notificationType === "system"
                                ? "fa-cog"
                                : "fa-truck"
                            } text-2xl mr-2`}
                            style={{ color: notification.color }}
                          ></i>
                          <span
                            className="font-bold text-xl"
                            style={{ color: notification.color }}
                          >
                            {notification.notificationType === "capacity" &&
                              `Fill Level: ${notification.fillLevel}%`}
                            {notification.notificationType === "system" &&
                              "System Update"}
                            {notification.notificationType === "collection" &&
                              "Collection Status"}
                          </span>
                          {!notification.read && (
                            <span className="ml-2 px-2 py-1 bg-red-100 text-red-600 text-xs rounded-full">
                              New
                            </span>
                          )}
                        </div>
                        <p className="font-medium text-[#1f2937] font-inter mb-2 text-base">
                          {notification.message}
                        </p>
                        <p className="text-sm text-gray-500 font-inter">
                          {new Date(notification.time).toLocaleDateString(
                            "en-US",
                            {
                              year: "numeric",
                              month: "long",
                              day: "numeric",
                              hour: "numeric",
                              minute: "numeric",
                              hour12: true,
                            }
                          )}
                        </p>
                      </div>
                      {!notification.read && (
                        <button
                          onClick={() => markAsRead(notification.id)}
                          className="flex items-center px-4 py-2 bg-[#7BC5AC] text-white rounded-lg hover:bg-[#6ab59b] transition-all duration-300 transform hover:scale-105 ml-4 shadow-lg"
                        >
                          <i className="fas fa-check mr-2"></i>
                          <span className="text-sm font-medium">
                            Mark as Read
                          </span>
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="w-full bg-gradient-to-br from-white to-[#f8fafc] rounded-xl shadow-lg hover:shadow-2xl transition-all duration-300 p-6 mb-12">
            <h2 className="text-2xl font-bold text-gray-800 font-inter mb-6">
              Future Developments
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-white p-6 rounded-lg shadow-md hover:shadow-xl transition-all duration-300">
                <div className="text-[#7BC5AC] text-3xl mb-4">
                  <i className="fas fa-map-marked-alt"></i>
                </div>
                <h3 className="font-bold text-gray-800 mb-2">
                  Real-time GPS Tracking
                </h3>
                <p className="text-gray-600 text-sm">
                  Live tracking of all smart bins and collection vehicles
                </p>
                <span className="inline-block mt-4 text-xs text-[#7BC5AC] font-medium">
                  Coming Q2 2025
                </span>
              </div>

              <div className="bg-white p-6 rounded-lg shadow-md hover:shadow-xl transition-all duration-300">
                <div className="text-[#7BC5AC] text-3xl mb-4">
                  <i className="fas fa-route"></i>
                </div>
                <h3 className="font-bold text-gray-800 mb-2">
                  Smart Route Optimization
                </h3>
                <p className="text-gray-600 text-sm">
                  AI-powered collection routes for maximum efficiency
                </p>
                <span className="inline-block mt-4 text-xs text-[#7BC5AC] font-medium">
                  Coming Q3 2025
                </span>
              </div>

              <div className="bg-white p-6 rounded-lg shadow-md hover:shadow-xl transition-all duration-300">
                <div className="text-[#7BC5AC] text-3xl mb-4">
                  <i className="fas fa-mobile-alt"></i>
                </div>
                <h3 className="font-bold text-gray-800 mb-2">Mobile App</h3>
                <p className="text-gray-600 text-sm">
                  Dedicated app for collectors and administrators
                </p>
                <span className="inline-block mt-4 text-xs text-[#7BC5AC] font-medium">
                  Coming Q4 2025
                </span>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 w-full mb-[calc(80px+env(safe-area-inset-bottom))]">
            <div className="bg-gradient-to-br from-white to-[#f8fafc] rounded-xl shadow-lg hover:shadow-2xl transition-all duration-300 p-6">
              <h2 className="text-xl font-bold text-gray-800 font-inter mb-4">
                Current Location
              </h2>
              <div className="w-full h-64 rounded-lg overflow-hidden mb-4">
                <img
                  src="https://cdn.vectorstock.com/i/1000x1000/76/22/city-map-with-popular-location-markers-vector-22577622.webp"
                  alt="Map showing 3 smart bin locations"
                  className="w-full h-64 rounded-lg object-cover"
                />
              </div>
              <div className="space-y-4">
                <div className="flex items-center justify-between p-3 bg-[#ebf7f4] rounded-lg">
                  <span className="text-gray-700 flex items-center">
                    <i className="fas fa-map-marker-alt text-[#7BC5AC] mr-2"></i>
                    Malad East, Mumbai
                  </span>
                  <button
                    onClick={toggleMap}
                    className="text-[#7BC5AC] hover:text-[#6ab59b] font-medium"
                  >
                    View Map
                  </button>
                </div>
                <div className="flex items-center justify-between p-3 bg-[#ebf7f4] rounded-lg">
                  <span className="text-gray-700">Nearest Collector</span>
                  <span className="text-[#7BC5AC] font-medium">
                    0.5 km away
                  </span>
                </div>
              </div>
            </div>

            <div className="bg-gradient-to-br from-white to-[#f8fafc] rounded-xl shadow-lg hover:shadow-2xl transition-all duration-300 p-6">
              <h2 className="text-xl font-bold text-gray-800 font-inter mb-4">
                Nearby Collectors
              </h2>
              {collectors.map((collector) => (
                <div
                  key={collector.id}
                  className="flex items-center justify-between mb-4"
                >
                  <div className="flex items-center">
                    <div className="w-12 h-12 bg-[#ebf7f4] rounded-full flex items-center justify-center">
                      <i className="fas fa-user text-[#7BC5AC] text-xl"></i>
                    </div>
                    <div className="ml-3">
                      <h3 className="font-medium text-gray-800">
                        {collector.name}
                      </h3>
                      <p className="text-sm text-gray-600">Malad East</p>
                    </div>
                  </div>
                  <div className="flex flex-col items-end">
                    <span className="text-green-500 text-sm">
                      Available Now
                    </span>
                    <span className="text-gray-600 text-sm">
                      ⭐ {collector.rating}
                    </span>
                  </div>
                </div>
              ))}
              <button className="w-full bg-[#7BC5AC] text-white py-3 rounded-lg hover:bg-[#6ab59b] transition-all duration-300">
                Contact Collector
              </button>
            </div>
          </div>

          {/*{error && (
            <div className="w-full mb-8 p-4 bg-red-100 text-red-700 rounded-lg font-inter">
              {error}
            </div>
          )}*/}
        </div>
      </main>

      <nav className="fixed bottom-0 left-0 right-0 bg-white/80 backdrop-blur-md border-t border-gray-200 md:hidden z-50 h-[60px] pb-[env(safe-area-inset-bottom)]">
        <div className="flex justify-around items-center h-full">
          <button
            onClick={() => {}}
            className="flex-1 flex flex-col items-center justify-center h-full text-[#7BC5AC]"
          >
            <i className="fas fa-home text-xl"></i>
            <span className="text-xs mt-1">Home</span>
          </button>
          <button
            onClick={toggleMap}
            className="flex-1 flex flex-col items-center justify-center h-full text-[#7BC5AC]"
          >
            <i className="fas fa-map text-xl"></i>
            <span className="text-xs mt-1">Map</span>
          </button>
          <button
            onClick={() => {}}
            className="flex-1 flex flex-col items-center justify-center h-full text-[#7BC5AC]"
          >
            <i className="fas fa-users text-xl"></i>
            <span className="text-xs mt-1">Collectors</span>
          </button>
          <button
            onClick={toggleDarkMode}
            className="flex-1 flex flex-col items-center justify-center h-full text-[#7BC5AC]"
          >
            <i className={`fas ${darkMode ? "fa-sun" : "fa-moon"} text-xl`}></i>
            <span className="text-xs mt-1">Theme</span>
          </button>
        </div>
      </nav>

      {/* <button
        onClick={() => {}}
        className="fixed right-4 bottom-[calc(80px+env(safe-area-inset-bottom))] md:bottom-4 bg-[#7BC5AC] w-14 h-14 rounded-full shadow-lg flex items-center justify-center text-white z-50 transform hover:scale-110 transition-all duration-300"
      >
        <i className="fas fa-plus text-xl"></i>
      </button> */}
      <meta
        name="viewport"
        content="width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no, viewport-fit=cover"
      />
      <meta name="apple-mobile-web-app-capable" content="yes" />
      <meta
        name="apple-mobile-web-app-status-bar-style"
        content="black-translucent"
      />
      <meta name="theme-color" content="#7BC5AC" />
      <footer className="bg-gradient-to-b from-gray-50 to-gray-100 mt-12 mb-[120px] md:mb-0">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <p className="text-gray-600 font-inter mb-4 md:mb-0 hover:text-[#7BC5AC] transition-all duration-300 transform hover:scale-105">
              © 2024 BinIt Smart Solutions
            </p>
            <div className="flex space-x-6">
              <a
                href="#"
                className="text-gray-600 hover:text-[#7BC5AC] transition-all duration-300 transform hover:scale-105 font-inter"
              >
                About
              </a>
              <a
                href="#"
                className="text-gray-600 hover:text-[#7BC5AC] transition-all duration-300 transform hover:scale-105 font-inter"
              >
                Contact
              </a>
              <a
                href="#"
                className="text-gray-600 hover:text-[#7BC5AC] transition-all duration-300 transform hover:scale-105 font-inter"
              >
                Privacy Policy
              </a>
            </div>
            <div className="flex space-x-4 mt-4 md:mt-0">
              <a
                href="#"
                className="text-gray-600 hover:text-[#7BC5AC] transition-all duration-300 transform hover:scale-110"
              >
                <i className="fab fa-linkedin text-2xl"></i>
              </a>
              <a
                href="#"
                className="text-gray-600 hover:text-[#7BC5AC] transition-all duration-300 transform hover:scale-110"
              >
                <i className="fab fa-twitter text-2xl"></i>
              </a>
            </div>
          </div>
        </div>
      </footer>
      <style jsx global>{`
        @keyframes pulse {
          0% { transform: scale(1); }
          50% { transform: scale(1.05); }
          100% { transform: scale(1); }
        }

        @keyframes glow {
          0% { box-shadow: 0 0 5px rgba(123, 197, 172, 0.5); }
          50% { box-shadow: 0 0 20px rgba(123, 197, 172, 0.8); }
          100% { box-shadow: 0 0 5px rgba(123, 197, 172, 0.5); }
        }

        @keyframes fillAnimation {
          from { transform: translateY(100%); }
          to { transform: translateY(0); }
        }

        @keyframes slideIn {
          from { transform: translateX(100%); }
          to { transform: translateX(0); }
        }

        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }

        .icon-pulse {
          animation: pulse 2s infinite;
        }

        .overview-glow {
          animation: glow 2s infinite;
        }

        .fill-animation {
          animation: fillAnimation 1s ease-out;
        }

        .slide-in {
          animation: slideIn 0.3s ease-out;
        }

        .fade-in {
          animation: fadeIn 0.3s ease-out;
        }

        html {
          scroll-behavior: smooth;
          overscroll-behavior-y: contain;
          -webkit-overflow-scrolling: touch;
          scroll-padding-bottom: calc(60px + env(safe-area-inset-bottom));
        }

        button, a {
          min-height: 44px;
          min-width: 44px;
        }
      `}</style>
    </div>
  );
}

export default MainComponent;