# Ali Pay2Play JC

> A full-stack campaign finance transparency platform that processed over **$6 million in political donations**, attracted **10,000+ monthly visitors** before Election Day, and was referenced during multiple Jersey City mayoral debates.

## Overview

Ali Pay2Play JC is a campaign finance analytics platform designed to make local election financing transparent and accessible to the public.

Government campaign finance reports are often difficult to navigate, requiring voters to sift through hundreds of pages of filings to understand who is funding political campaigns. This project transforms those filings into interactive visualizations and searchable analytics dashboards, allowing users to explore donation trends, contributor behavior, fundraising performance, and campaign finance activity in real time.

The platform was used throughout the Jersey City mayoral election cycle and became a public resource for voters, journalists, campaign staff, and community members seeking greater transparency into local politics.

---

## Impact

### Public Reach

* Reached **10,000+ monthly visitors** prior to the November general election
* Referenced during **multiple mayoral debates**
* Became a widely shared campaign finance resource within Jersey City

### Data Scale

* Processed and analyzed **$6,000,000+** in campaign contributions
* Aggregated thousands of donation records across multiple reporting periods
* Generated interactive visualizations from complex public finance filings

### Real-World Outcomes

* Increased accessibility of campaign finance information
* Helped identify fundraising trends and donor concentration patterns
* Enabled voters to better understand financial influences in local elections

---

## Features

### Interactive Donation Analytics

* Campaign fundraising dashboards
* Candidate donation comparisons
* Contribution trend analysis
* Time-series fundraising visualizations
* Donor concentration breakdowns

### Data Processing Pipeline

* Automated ingestion of campaign finance reports
* Data cleaning and normalization
* Contributor grouping and aggregation
* Transformation of raw filings into analytics-ready datasets

### Transparency Tools

* Searchable campaign finance records
* Candidate-level fundraising metrics
* Historical reporting comparisons
* Public-facing visualization platform

---

## Tech Stack

### Frontend

#### React

Used to build responsive and interactive data dashboards.

Responsibilities:

* Data visualization components
* Dynamic chart rendering
* State management
* User interface development

#### JavaScript

Used throughout the frontend application for business logic and data interaction.

#### HTML5 & CSS3

Used for layout design, responsiveness, accessibility, and styling.

#### Vercel

Frontend deployment platform providing:

* Continuous deployment
* Production hosting
* Performance optimization

---

### Backend

#### Python

Primary backend language used for:

* Data processing
* API development
* Analytics workflows

#### Flask

Used to:

* Serve campaign finance data
* Expose API endpoints
* Connect frontend visualizations to processed datasets

---

### Data Engineering & Analytics

#### Pandas

Core data processing library used for:

* Cleaning campaign finance reports
* Data normalization
* Contributor grouping
* Donation aggregation
* Feature generation
* Data transformation pipelines

Examples:

* Grouping donations by contributor
* Calculating candidate fundraising totals
* Aggregating donations across reporting periods
* Identifying major donor patterns

#### Matplotlib

Used during exploratory analysis and development for:

* Data validation
* Trend analysis
* Visual inspection of reporting data
* Analytics prototyping

---

### Infrastructure

#### Render

Used for:

* Backend deployment
* Scheduled data pipeline execution
* Hosting Flask services
* Automated dataset updates

---

## System Architecture

```text
Campaign Finance Filings
            │
            ▼
     Python ETL Pipeline
       (Pandas)
            │
            ▼
     Data Cleaning &
      Aggregation
            │
            ▼
        Flask API
            │
            ▼
      React Frontend
            │
            ▼
 Interactive Analytics
     & Visualizations
```

---

## Key Technical Challenges

### 1. Cleaning Real Government Data

Campaign finance records frequently contain:

* Duplicate donor entries
* Inconsistent naming conventions
* Missing information
* Formatting inconsistencies

Custom Pandas pipelines were developed to normalize records and improve data quality before analysis.

---

### 2. Donation Aggregation

Many contributors appear multiple times across separate filings.

The system groups and aggregates records to provide:

* Total contribution amounts
* Candidate fundraising summaries
* Donor-level analytics
* Historical donation trends

---

### 3. Building Public-Facing Analytics

Raw election filings can be overwhelming for non-technical users.

The platform transforms thousands of records into intuitive visualizations that communicate insights quickly and effectively.

---

## Skills Demonstrated

### Software Engineering

* Full-stack development
* REST API design
* React application architecture
* Frontend deployment
* Backend deployment

### Data Engineering

* ETL pipeline development
* Data cleaning
* Data transformation
* Data aggregation
* Data validation

### Analytics

* Exploratory data analysis
* Trend discovery
* Large-scale dataset processing
* Public-sector data analysis

### Product Development

* Building for real users
* Performance optimization
* Information accessibility
* Data storytelling

---

## Results

Ali Pay2Play JC demonstrates the ability to:

* Build production-ready full-stack applications
* Design scalable data pipelines
* Process millions of dollars worth of financial records
* Create impactful civic technology solutions
* Deliver analytics tools used by thousands of users

This project combined software engineering, data analytics, and public transparency to help voters better understand campaign financing during one of Jersey City's most closely watched elections.

---

## Author

**Koen Mitchel Santos**

M.S. Machine Learning Candidate
Stevens Institute of Technology

Interests:

* Software Engineering
* Data Analytics
* Machine Learning
* Civic Technology
* Data Visualization

---

*"Making campaign finance data accessible, understandable, and transparent for everyone."*
