import { Link } from 'react-router-dom'
import { Badge, Button, Card, CardContent, CardHeader } from '@/components/ui'

interface CareerDemo {
  name: string
  category: string
  description: string
  skills: string[]
}

const careers: CareerDemo[] = [
  {
    name: 'Software Developer',
    category: 'Engineering',
    description: 'Build and maintain the applications that power products end to end.',
    skills: ['Programming', 'Data Structures', 'Git'],
  },
  {
    name: 'Frontend Developer',
    category: 'Engineering',
    description: 'Turn designs into fast, accessible user interfaces.',
    skills: ['HTML/CSS', 'JavaScript', 'React'],
  },
  {
    name: 'Backend Developer',
    category: 'Engineering',
    description: 'Design the APIs, data models and systems behind an app.',
    skills: ['APIs', 'Databases', 'System Design'],
  },
  {
    name: 'Full Stack Developer',
    category: 'Engineering',
    description: 'Work across the entire stack, from interface to database.',
    skills: ['Frontend', 'Backend', 'Databases'],
  },
  {
    name: 'Data Analyst',
    category: 'Data',
    description: 'Turn raw data into decisions stakeholders can act on.',
    skills: ['SQL', 'Excel', 'Visualization'],
  },
  {
    name: 'Data Scientist',
    category: 'Data',
    description: 'Build models that find patterns and explain outcomes.',
    skills: ['Python', 'Statistics', 'ML Basics'],
  },
  {
    name: 'Machine Learning Engineer',
    category: 'Data',
    description: 'Take models from notebook to a working production system.',
    skills: ['Python', 'ML', 'MLOps'],
  },
  {
    name: 'Cybersecurity Analyst',
    category: 'Security',
    description: 'Protect systems and data from evolving threats.',
    skills: ['Networking', 'Security Fundamentals', 'Linux'],
  },
  {
    name: 'Cloud / DevOps Engineer',
    category: 'Infrastructure',
    description: 'Build and operate the infrastructure teams ship on.',
    skills: ['Cloud Platforms', 'CI/CD', 'Containers'],
  },
  {
    name: 'UI/UX Designer',
    category: 'Design',
    description: 'Design experiences that are usable, clear and trustworthy.',
    skills: ['User Research', 'Wireframing', 'Prototyping'],
  },
]

export function CareerPreview() {
  return (
    <section id="careers" className="scroll-mt-20 bg-background">
      <div className="mx-auto max-w-7xl px-4 py-16 md:px-8 md:py-24">
        <div className="max-w-2xl">
          <p className="text-label uppercase tracking-wide text-primary">Career exploration</p>
          <h2 className="mt-2 text-h2 text-text-primary">More than a career list.</h2>
          <p className="mt-3 text-body text-text-secondary">
            PathPilot's initial set spans ten career paths common to engineering and CS students.
            Later, comparisons here become personalized to your own profile — for now, here's
            the starting universe.
          </p>
        </div>

        <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
          {careers.map((career) => (
            <Card key={career.name} className="transition-shadow hover:shadow-md">
              <CardHeader>
                <Badge variant="neutral" className="w-fit">
                  {career.category}
                </Badge>
                <h3 className="mt-1 text-h3 text-text-primary">{career.name}</h3>
              </CardHeader>
              <CardContent className="flex flex-col gap-3">
                <p>{career.description}</p>
                <div className="flex flex-wrap gap-1.5">
                  {career.skills.map((skill) => (
                    <Badge key={skill} variant="default">
                      {skill}
                    </Badge>
                  ))}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="mt-8 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <p className="max-w-xl text-body-sm text-text-muted">
            This is a preview of PathPilot's initial career set. In Phase 6, comparisons become
            personalized to your student profile.
          </p>
          <Link to="/careers" className="shrink-0">
            <Button variant="secondary" size="md">
              Browse Full Career Explorer →
            </Button>
          </Link>
        </div>
      </div>
    </section>
  )
}
