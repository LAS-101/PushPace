"use client";

import { type FormEvent, useState } from "react";
import { api, errorMessage } from "@/lib/api";
import type { Gender, Profile } from "@/lib/types";
import { Modal } from "./Modal";

interface ProfileModalProps {
  profile: Profile | null;
  firstTime: boolean;
  onSaved: (profile: Profile) => void;
  onClose: () => void;
}

export function ProfileModal({ profile, firstTime, onSaved, onClose }: ProfileModalProps) {
  const [saving, setSaving] = useState(false);

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    setSaving(true);
    try {
      const { profile: updated } = await api.updateProfile({
        weight: parseFloat(String(fd.get("weight"))),
        height: parseInt(String(fd.get("height")), 10),
        age: parseInt(String(fd.get("age")), 10),
        gender: fd.get("gender") as Gender,
      });
      onSaved(updated);
    } catch (error) {
      alert(`Error saving profile: ${errorMessage(error)}`);
    } finally {
      setSaving(false);
    }
  }

  return (
    <Modal title={firstTime ? "Welcome to PushPace 👋" : "Edit Profile"} onClose={firstTime ? undefined : onClose}>
      <p className="modal-subtitle">
        {firstTime
          ? "To calculate your calories accurately, we need a few details about you."
          : "Update your personal details."}
      </p>
      <form className="modal-form" onSubmit={handleSubmit}>
        <div className="form-row">
          <div className="form-group">
            <label htmlFor="field-weight">Weight (kg)</label>
            <input
              type="number"
              id="field-weight"
              name="weight"
              min={30}
              max={300}
              step={0.1}
              placeholder="75"
              defaultValue={profile?.weight ?? undefined}
              required
            />
          </div>
          <div className="form-group">
            <label htmlFor="field-height">Height (cm)</label>
            <input
              type="number"
              id="field-height"
              name="height"
              min={100}
              max={250}
              placeholder="175"
              defaultValue={profile?.height ?? undefined}
              required
            />
          </div>
        </div>
        <div className="form-row">
          <div className="form-group">
            <label htmlFor="field-age">Age</label>
            <input
              type="number"
              id="field-age"
              name="age"
              min={10}
              max={120}
              placeholder="22"
              defaultValue={profile?.age ?? undefined}
              required
            />
          </div>
          <div className="form-group">
            <label htmlFor="field-gender">Gender</label>
            <select id="field-gender" name="gender" defaultValue={profile?.gender ?? ""} required>
              <option value="" disabled>
                Select
              </option>
              <option value="male">Male</option>
              <option value="female">Female</option>
            </select>
          </div>
        </div>
        <button type="submit" className="modal-submit" disabled={saving}>
          {saving ? "Saving…" : "Save Profile"}
        </button>
      </form>
    </Modal>
  );
}
