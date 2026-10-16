using System;
using System.Runtime.InteropServices;

// Windows Shell property APIs; no application binaries or credentials are edited.
public static class AntigravityTaskbarIdentity
{
    [StructLayout(LayoutKind.Sequential)]
    private struct PropertyKey
    {
        public Guid Format;
        public uint Id;
        public PropertyKey(uint id) { Format = new Guid("9F4C2855-9F79-4B39-A8D0-E1D42DE1D5F3"); Id = id; }
    }
    [StructLayout(LayoutKind.Explicit, Size = 24)]
    private struct PropVariant
    {
        [FieldOffset(0)] public ushort Type;
        [FieldOffset(8)] public IntPtr Text;
    }
    [ComImport, Guid("886D8EEB-8CF2-4446-8D02-CDBA1DBDCF99"), InterfaceType(ComInterfaceType.InterfaceIsIUnknown)]
    private interface IPropertyStore
    {
        void GetCount(out uint count);
        void GetAt(uint index, out PropertyKey key);
        void GetValue(ref PropertyKey key, out PropVariant value);
        void SetValue(ref PropertyKey key, ref PropVariant value);
        void Commit();
    }
    [DllImport("shell32.dll", PreserveSig = false)]
    private static extern void SHGetPropertyStoreForWindow(IntPtr window, ref Guid iid, [MarshalAs(UnmanagedType.Interface)] out IPropertyStore store);
    [DllImport("shell32.dll", CharSet = CharSet.Unicode, PreserveSig = false)]
    private static extern void SHGetPropertyStoreFromParsingName(string path, IntPtr context, uint flags, ref Guid iid, [MarshalAs(UnmanagedType.Interface)] out IPropertyStore store);
    [DllImport("ole32.dll")]
    private static extern int PropVariantClear(ref PropVariant value);

    private static void SetString(IPropertyStore store, uint id, string text)
    {
        PropertyKey key = new PropertyKey(id);
        PropVariant value = new PropVariant { Type = 31, Text = Marshal.StringToCoTaskMemUni(text) };
        try { store.SetValue(ref key, ref value); }
        finally { PropVariantClear(ref value); }
    }
    private static void Apply(IPropertyStore store, string appId, string command, string icon, bool commit)
    {
        // Relaunch metadata precedes the explicit ID as recommended by Windows.
        SetString(store, 2, command);
        SetString(store, 3, icon + ",0");
        SetString(store, 4, "Antigravity B");
        SetString(store, 5, appId);
        // Window stores apply properties immediately; only file stores commit.
        if (commit) store.Commit();
    }
    public static void SetShortcut(string path, string appId, string command, string icon)
    {
        Guid iid = typeof(IPropertyStore).GUID;
        IPropertyStore store;
        SHGetPropertyStoreFromParsingName(path, IntPtr.Zero, 2, ref iid, out store);
        try { Apply(store, appId, command, icon, true); }
        finally { Marshal.ReleaseComObject(store); }
    }
    public static void SetWindow(IntPtr window, string appId, string command, string icon)
    {
        Guid iid = typeof(IPropertyStore).GUID;
        IPropertyStore store;
        SHGetPropertyStoreForWindow(window, ref iid, out store);
        try { Apply(store, appId, command, icon, false); }
        finally { Marshal.ReleaseComObject(store); }
    }
    public static string ReadShortcutId(string path)
    {
        Guid iid = typeof(IPropertyStore).GUID;
        IPropertyStore store;
        SHGetPropertyStoreFromParsingName(path, IntPtr.Zero, 0, ref iid, out store);
        try {
            PropertyKey key = new PropertyKey(5);
            PropVariant value;
            store.GetValue(ref key, out value);
            try { return value.Type == 31 ? Marshal.PtrToStringUni(value.Text) : null; }
            finally { PropVariantClear(ref value); }
        } finally { Marshal.ReleaseComObject(store); }
    }
}
