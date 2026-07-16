// Site configuration for managing sections on the home page
// Set enabled to false to hide a section, or leave items array empty

export interface SectionConfig {
  enabled: boolean;
  title: string;
  description?: string;
  items?: any[];
}

export interface SiteConfig {
  sections: {
    projects: SectionConfig;
    experience: SectionConfig;
    techStack: SectionConfig;
    writing: SectionConfig;
    testimonials: SectionConfig;
  };
}

export const siteConfig: SiteConfig = {
  sections: {
    // Projects Section
    projects: {
      enabled: false, // Set to true to show this section
      title: "Projects",
      description: "Explore featured projects and case studies.",
      items: [
        // Add your projects here
        // {
        //   title: "Project Name",
        //   description: "Project description",
        //   link: "/projects/project-slug",
        //   tags: ["React", "TypeScript", "Next.js"]
        // }
      ],
    },

    // Experience Section
    experience: {
      enabled: false, // Set to true to show this section
      title: "Experience",
      description: "Professional experience and work history.",
      items: [
        // Add your experience here
        // {
        //   company: "Company Name",
        //   position: "Job Title",
        //   period: "Jan 2023 - Present",
        //   description: "What you did at this job",
        // }
      ],
    },

    // Tech Stack Section
    techStack: {
      enabled: false, // Set to true to show this section
      title: "Tech Stack",
      description: "Technologies and tools I work with.",
      items: [
        // Add your tech stack here
        // "React",
        // "TypeScript",
        // "Next.js",
        // "Node.js",
      ],
    },

    // Writing Section
    writing: {
      enabled: false, // Set to true to show this section
      title: "Writing",
      description: "Articles, blog posts, and technical writing.",
      items: [
        // Add your writing here
        // {
        //   title: "Article Title",
        //   description: "Article description",
        //   link: "https://example.com/article",
        //   date: "2025-01-15",
        // }
      ],
    },

    // Testimonials Section
    testimonials: {
      enabled: false, // Set to true to show this section
      title: "Testimonials",
      description: "What people say about working with me.",
      items: [
        // Add testimonials here
        // {
        //   name: "Person Name",
        //   position: "Their Job Title",
        //   company: "Company Name",
        //   text: "The testimonial text goes here",
        // }
      ],
    },
  },
};

// Helper function to check if a section should be displayed
export const shouldShowSection = (sectionKey: keyof SiteConfig['sections']): boolean => {
  const section = siteConfig.sections[sectionKey];
  return section.enabled && (section.items ? section.items.length > 0 : true);
};

