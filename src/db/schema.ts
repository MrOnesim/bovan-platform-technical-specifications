import {
  pgTable,
  text,
  integer,
  boolean,
  timestamp,
  uuid,
  pgEnum,
  primaryKey,
  uniqueIndex,
  index,
  jsonb,
  varchar,
} from "drizzle-orm/pg-core";
import { relations, sql } from "drizzle-orm";

// ============================================================
// Enums
// ============================================================

export const userRoleEnum = pgEnum("user_role", ["TALENT", "COMPANY", "ADMIN"]);
export const availabilityEnum = pgEnum("availability", [
  "AVAILABLE",
  "OPEN_TO_OPPORTUNITIES",
  "EMPLOYED",
  "NOT_AVAILABLE",
]);
export const employmentTypeEnum = pgEnum("employment_type", [
  "FULL_TIME",
  "PART_TIME",
  "FREELANCE",
  "INTERNSHIP",
  "CONTRACT",
  "VOLUNTEER",
  "PROJECT",
  "REMOTE",
]);
export const experienceLevelEnum = pgEnum("experience_level", [
  "JUNIOR",
  "MID",
  "SENIOR",
  "LEAD",
  "EXECUTIVE",
  "INTERN",
  "ENTRY",
]);
export const profileVisibilityEnum = pgEnum("profile_visibility", [
  "PUBLIC",
  "MEMBERS_ONLY",
  "PRIVATE",
]);
export const remotePreferenceEnum = pgEnum("remote_preference", [
  "ON_SITE",
  "HYBRID",
  "REMOTE",
  "ANY",
]);
export const opportunityStatusEnum = pgEnum("opportunity_status", [
  "DRAFT",
  "PUBLISHED",
  "CLOSED",
  "ARCHIVED",
]);
export const applicationStatusEnum = pgEnum("application_status", [
  "SUBMITTED",
  "VIEWED",
  "SHORTLISTED",
  "INTERVIEW",
  "ACCEPTED",
  "REJECTED",
  "WITHDRAWN",
]);
export const companyVerificationEnum = pgEnum("company_verification", [
  "PENDING",
  "VERIFIED",
  "REJECTED",
]);
export const notificationTypeEnum = pgEnum("notification_type", [
  "NEW_MESSAGE",
  "APPLICATION_RECEIVED",
  "APPLICATION_VIEWED",
  "APPLICATION_STATUS_CHANGED",
  "PROFILE_VIEWED",
  "NEW_MATCH",
  "NEW_OPPORTUNITY",
  "ACCOUNT_VERIFIED",
]);
export const reportStatusEnum = pgEnum("report_status", [
  "PENDING",
  "RESOLVED",
  "DISMISSED",
]);
export const reportTargetEnum = pgEnum("report_target", [
  "TALENT",
  "COMPANY",
  "OPPORTUNITY",
  "MESSAGE",
  "PORTFOLIO",
]);
export const reportReasonEnum = pgEnum("report_reason", [
  "FAKE_PROFILE",
  "SCAM",
  "INAPPROPRIATE_CONTENT",
  "FAKE_COMPANY",
  "HARASSMENT",
  "OTHER",
]);
export const favoriteTargetEnum = pgEnum("favorite_target", [
  "TALENT",
  "OPPORTUNITY",
  "COMPANY",
]);
export const skillCategoryEnum = pgEnum("skill_category", [
  "TECHNOLOGY",
  "DESIGN",
  "MARKETING",
  "BUSINESS",
  "COMMUNICATION",
  "ENGINEERING",
  "CRAFT",
  "AGRICULTURE",
  "HEALTH",
  "EDUCATION",
  "FINANCE",
  "LEGAL",
  "CREATIVE",
  "OTHER",
]);

// ============================================================
// Reference data
// ============================================================

export const countries = pgTable(
  "countries",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    iso2: varchar("iso2", { length: 2 }).notNull(),
    iso3: varchar("iso3", { length: 3 }).notNull(),
    name: text("name").notNull(),
    nameFr: text("name_fr").notNull(),
    flag: text("flag").notNull(),
    capital: text("capital"),
    region: text("region"),
    // SVG path id for the Africa map
    mapId: text("map_id"),
    // approximate centroid for label placement
    labelX: integer("label_x"),
    labelY: integer("label_y"),
    createdAt: timestamp("created_at").defaultNow().notNull(),
  },
  (t) => ({
    iso2Idx: uniqueIndex("countries_iso2_idx").on(t.iso2),
  })
);

export const cities = pgTable(
  "cities",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    name: text("name").notNull(),
    countryId: uuid("country_id")
      .notNull()
      .references(() => countries.id, { onDelete: "cascade" }),
    createdAt: timestamp("created_at").defaultNow().notNull(),
  },
  (t) => ({
    countryIdx: index("cities_country_idx").on(t.countryId),
  })
);

export const skills = pgTable(
  "skills",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    name: text("name").notNull(),
    slug: text("slug").notNull(),
    category: skillCategoryEnum("category").default("OTHER").notNull(),
    createdAt: timestamp("created_at").defaultNow().notNull(),
  },
  (t) => ({
    slugIdx: uniqueIndex("skills_slug_idx").on(t.slug),
  })
);

// ============================================================
// Users
// ============================================================

export const users = pgTable(
  "users",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    email: text("email").notNull(),
    passwordHash: text("password_hash").notNull(),
    role: userRoleEnum("role").notNull().default("TALENT"),
    firstName: text("first_name"),
    lastName: text("last_name"),
    phone: text("phone"),
    avatarUrl: text("avatar_url"),
    countryId: uuid("country_id").references(() => countries.id, {
      onDelete: "set null",
    }),
    cityId: uuid("city_id").references(() => cities.id, {
      onDelete: "set null",
    }),
    isVerified: boolean("is_verified").default(false).notNull(),
    isActive: boolean("is_active").default(true).notNull(),
    isEmailVerified: boolean("is_email_verified").default(false).notNull(),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at").defaultNow().notNull(),
  },
  (t) => ({
    emailIdx: uniqueIndex("users_email_idx").on(t.email),
  })
);

export const sessions = pgTable("sessions", {
  id: uuid("id").defaultRandom().primaryKey(),
  userId: uuid("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  token: text("token").notNull(),
  expiresAt: timestamp("expires_at").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// ============================================================
// Talent
// ============================================================

export const talentProfiles = pgTable(
  "talent_profiles",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    userId: uuid("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    slug: text("slug").notNull(),
    headline: text("headline"),
    biography: text("biography"),
    profession: text("profession"),
    availability: availabilityEnum("availability")
      .default("OPEN_TO_OPPORTUNITIES")
      .notNull(),
    experienceLevel: experienceLevelEnum("experience_level")
      .default("ENTRY")
      .notNull(),
    yearsExperience: integer("years_experience").default(0).notNull(),
    salaryExpectation: integer("salary_expectation"),
    currency: varchar("currency", { length: 3 }).default("USD"),
    remotePreference: remotePreferenceEnum("remote_preference")
      .default("ANY")
      .notNull(),
    profileVisibility: profileVisibilityEnum("profile_visibility")
      .default("PUBLIC")
      .notNull(),
    cvUrl: text("cv_url"),
    portfolioUrl: text("portfolio_url"),
    linkedinUrl: text("linkedin_url"),
    githubUrl: text("github_url"),
    websiteUrl: text("website_url"),
    completionScore: integer("completion_score").default(0).notNull(),
    isSpontaneous: boolean("is_spontaneous").default(true).notNull(),
    viewsCount: integer("views_count").default(0).notNull(),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at").defaultNow().notNull(),
  },
  (t) => ({
    slugIdx: uniqueIndex("talent_slug_idx").on(t.slug),
    userIdx: uniqueIndex("talent_user_idx").on(t.userId),
  })
);

export const talentSkills = pgTable(
  "talent_skills",
  {
    talentId: uuid("talent_id")
      .notNull()
      .references(() => talentProfiles.id, { onDelete: "cascade" }),
    skillId: uuid("skill_id")
      .notNull()
      .references(() => skills.id, { onDelete: "cascade" }),
    level: integer("level").default(3).notNull(),
  },
  (t) => ({
    pk: primaryKey({ columns: [t.talentId, t.skillId] }),
    skillIdx: index("talent_skills_skill_idx").on(t.skillId),
  })
);

export const experiences = pgTable("experiences", {
  id: uuid("id").defaultRandom().primaryKey(),
  talentId: uuid("talent_id")
    .notNull()
    .references(() => talentProfiles.id, { onDelete: "cascade" }),
  company: text("company").notNull(),
  position: text("position").notNull(),
  description: text("description"),
  location: text("location"),
  startDate: timestamp("start_date"),
  endDate: timestamp("end_date"),
  isCurrent: boolean("is_current").default(false).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const educations = pgTable("educations", {
  id: uuid("id").defaultRandom().primaryKey(),
  talentId: uuid("talent_id")
    .notNull()
    .references(() => talentProfiles.id, { onDelete: "cascade" }),
  institution: text("institution").notNull(),
  degree: text("degree"),
  field: text("field"),
  startDate: timestamp("start_date"),
  endDate: timestamp("end_date"),
  description: text("description"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const portfolioItems = pgTable("portfolio_items", {
  id: uuid("id").defaultRandom().primaryKey(),
  talentId: uuid("talent_id")
    .notNull()
    .references(() => talentProfiles.id, { onDelete: "cascade" }),
  title: text("title").notNull(),
  description: text("description"),
  imageUrl: text("image_url"),
  projectUrl: text("project_url"),
  category: text("category"),
  technologies: text("technologies").array().default(sql`ARRAY[]::text[]`),
  published: boolean("published").default(true).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// ============================================================
// Company
// ============================================================

export const companies = pgTable(
  "companies",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    ownerId: uuid("owner_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    name: text("name").notNull(),
    slug: text("slug").notNull(),
    logo: text("logo"),
    coverImage: text("cover_image"),
    description: text("description"),
    industry: text("industry"),
    website: text("website"),
    email: text("email"),
    phone: text("phone"),
    countryId: uuid("country_id").references(() => countries.id, {
      onDelete: "set null",
    }),
    cityId: uuid("city_id").references(() => cities.id, {
      onDelete: "set null",
    }),
    employeeCount: integer("employee_count"),
    foundedYear: integer("founded_year"),
    verification: companyVerificationEnum("verification")
      .default("PENDING")
      .notNull(),
    socialLinks: jsonb("social_links").$type<{
      linkedin?: string;
      twitter?: string;
      facebook?: string;
      instagram?: string;
    }>(),
    isActive: boolean("is_active").default(true).notNull(),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at").defaultNow().notNull(),
  },
  (t) => ({
    slugIdx: uniqueIndex("companies_slug_idx").on(t.slug),
    ownerIdx: index("companies_owner_idx").on(t.ownerId),
  })
);

// ============================================================
// Opportunities & Applications
// ============================================================

export const opportunities = pgTable(
  "opportunities",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    companyId: uuid("company_id")
      .notNull()
      .references(() => companies.id, { onDelete: "cascade" }),
    title: text("title").notNull(),
    slug: text("slug").notNull(),
    description: text("description").notNull(),
    location: text("location"),
    countryId: uuid("country_id").references(() => countries.id, {
      onDelete: "set null",
    }),
    employmentType: employmentTypeEnum("employment_type")
      .default("FULL_TIME")
      .notNull(),
    experienceLevel: experienceLevelEnum("experience_level")
      .default("ENTRY")
      .notNull(),
    salaryMin: integer("salary_min"),
    salaryMax: integer("salary_max"),
    currency: varchar("currency", { length: 3 }).default("USD"),
    remote: boolean("remote").default(false).notNull(),
    deadline: timestamp("deadline"),
    status: opportunityStatusEnum("status").default("PUBLISHED").notNull(),
    publishedAt: timestamp("published_at"),
    viewsCount: integer("views_count").default(0).notNull(),
    skills: text("skills").array().default(sql`ARRAY[]::text[]`),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at").defaultNow().notNull(),
  },
  (t) => ({
    slugIdx: uniqueIndex("opportunities_slug_idx").on(t.slug),
    companyIdx: index("opportunities_company_idx").on(t.companyId),
    statusIdx: index("opportunities_status_idx").on(t.status),
  })
);

export const applications = pgTable(
  "applications",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    opportunityId: uuid("opportunity_id")
      .notNull()
      .references(() => opportunities.id, { onDelete: "cascade" }),
    talentId: uuid("talent_id")
      .notNull()
      .references(() => talentProfiles.id, { onDelete: "cascade" }),
    coverLetter: text("cover_letter"),
    cvUrl: text("cv_url"),
    status: applicationStatusEnum("status").default("SUBMITTED").notNull(),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at").defaultNow().notNull(),
  },
  (t) => ({
    oppIdx: index("applications_opp_idx").on(t.opportunityId),
    talentIdx: index("applications_talent_idx").on(t.talentId),
  })
);

// ============================================================
// Messaging
// ============================================================

export const conversations = pgTable(
  "conversations",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    companyId: uuid("company_id")
      .notNull()
      .references(() => companies.id, { onDelete: "cascade" }),
    talentId: uuid("talent_id")
      .notNull()
      .references(() => talentProfiles.id, { onDelete: "cascade" }),
    lastMessageAt: timestamp("last_message_at").defaultNow().notNull(),
    createdAt: timestamp("created_at").defaultNow().notNull(),
  },
  (t) => ({
    pairIdx: index("conversations_pair_idx").on(t.companyId, t.talentId),
  })
);

export const messages = pgTable(
  "messages",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    conversationId: uuid("conversation_id")
      .notNull()
      .references(() => conversations.id, { onDelete: "cascade" }),
    senderId: uuid("sender_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    content: text("content").notNull(),
    readAt: timestamp("read_at"),
    createdAt: timestamp("created_at").defaultNow().notNull(),
  },
  (t) => ({
    convIdx: index("messages_conv_idx").on(t.conversationId),
  })
);

// ============================================================
// Favorites & Notifications & Reports
// ============================================================

export const favorites = pgTable(
  "favorites",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    userId: uuid("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    targetType: favoriteTargetEnum("target_type").notNull(),
    targetId: uuid("target_id").notNull(),
    createdAt: timestamp("created_at").defaultNow().notNull(),
  },
  (t) => ({
    uniqIdx: uniqueIndex("favorites_user_target_idx").on(
      t.userId,
      t.targetType,
      t.targetId
    ),
  })
);

export const notifications = pgTable(
  "notifications",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    userId: uuid("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    type: notificationTypeEnum("type").notNull(),
    title: text("title").notNull(),
    body: text("body"),
    link: text("link"),
    readAt: timestamp("read_at"),
    createdAt: timestamp("created_at").defaultNow().notNull(),
  },
  (t) => ({
    userIdx: index("notifications_user_idx").on(t.userId),
  })
);

export const reports = pgTable("reports", {
  id: uuid("id").defaultRandom().primaryKey(),
  reporterId: uuid("reporter_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  targetType: reportTargetEnum("target_type").notNull(),
  targetId: uuid("target_id").notNull(),
  reason: reportReasonEnum("reason").notNull(),
  description: text("description"),
  status: reportStatusEnum("status").default("PENDING").notNull(),
  resolvedAt: timestamp("resolved_at"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// ============================================================
// Relations
// ============================================================

export const usersRelations = relations(users, ({ one, many }) => ({
  country: one(countries, {
    fields: [users.countryId],
    references: [countries.id],
  }),
  city: one(cities, { fields: [users.cityId], references: [cities.id] }),
  talentProfile: one(talentProfiles, {
    fields: [users.id],
    references: [talentProfiles.userId],
  }),
  companies: many(companies),
}));

export const talentProfilesRelations = relations(
  talentProfiles,
  ({ one, many }) => ({
    user: one(users, {
      fields: [talentProfiles.userId],
      references: [users.id],
    }),
    skills: many(talentSkills),
    experiences: many(experiences),
    educations: many(educations),
    portfolio: many(portfolioItems),
    applications: many(applications),
  })
);

export const talentSkillsRelations = relations(talentSkills, ({ one }) => ({
  talent: one(talentProfiles, {
    fields: [talentSkills.talentId],
    references: [talentProfiles.id],
  }),
  skill: one(skills, { fields: [talentSkills.skillId], references: [skills.id] }),
}));

export const companiesRelations = relations(companies, ({ one, many }) => ({
  owner: one(users, { fields: [companies.ownerId], references: [users.id] }),
  country: one(countries, {
    fields: [companies.countryId],
    references: [countries.id],
  }),
  city: one(cities, { fields: [companies.cityId], references: [cities.id] }),
  opportunities: many(opportunities),
}));

export const opportunitiesRelations = relations(opportunities, ({ one, many }) => ({
  company: one(companies, {
    fields: [opportunities.companyId],
    references: [companies.id],
  }),
  country: one(countries, {
    fields: [opportunities.countryId],
    references: [countries.id],
  }),
  applications: many(applications),
}));

export const applicationsRelations = relations(applications, ({ one }) => ({
  opportunity: one(opportunities, {
    fields: [applications.opportunityId],
    references: [opportunities.id],
  }),
  talent: one(talentProfiles, {
    fields: [applications.talentId],
    references: [talentProfiles.id],
  }),
}));
